"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const HOUSEHOLD_STORAGE_KEYS = [
  "plan-0-emergency-contacts-v1",
  "plan-0-medical-profiles-v1",
  "plan-0-medical-notes-v1",
  "plan-0-supplies-v1",
  "plan-0-plan-tasks-v1",
  "plan-0-emergency-plan-v1",
] as const;

const HOUSEHOLD_CHANGE_EVENTS = [
  "plan-0-db-change",
  "plan-0-emergency-contacts-change",
  "plan-0-medical-profiles-change",
  "plan-0-medical-notes-change",
  "plan-0-supplies-change",
  "plan-0-plan-tasks-change",
  "plan-0-emergency-plan-change",
];

type ConnectionStatus = "online" | "offline";

type OfflineResilienceContextValue = {
  connectionStatus: ConnectionStatus;
};

const OfflineResilienceContext = createContext<OfflineResilienceContextValue | null>(null);

function getConnectionStatus(): ConnectionStatus {
  if (typeof navigator === "undefined") return "online";
  return navigator.onLine ? "online" : "offline";
}

function subscribeToConnectionStatus(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function householdSnapshot(): Record<string, string | null> {
  return Object.fromEntries(
    HOUSEHOLD_STORAGE_KEYS.map((key) => [key, window.localStorage.getItem(key)]),
  );
}

function postToActiveWorker(message: unknown) {
  navigator.serviceWorker.controller?.postMessage(message);
}

function cacheCurrentPageResources() {
  const urls = new Set<string>();
  const collect = (value: string | null) => {
    if (!value) return;
    const url = new URL(value, window.location.href);
    if (url.origin === window.location.origin) urls.add(url.href);
  };

  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((element) => collect(element.src));
  document.querySelectorAll<HTMLLinkElement>("link[rel=\"stylesheet\"][href], link[rel=\"manifest\"][href]").forEach((element) => collect(element.href));
  document.querySelectorAll<HTMLImageElement>("img[src]").forEach((element) => collect(element.src));
  performance.getEntriesByType("resource").forEach((entry) => collect(entry.name));

  if (urls.size > 0) postToActiveWorker({ type: "CACHE_URLS", urls: [...urls] });
}

async function removeDevelopmentOfflineCache() {
  const [registrations, cacheNames] = await Promise.all([
    navigator.serviceWorker.getRegistrations(),
    caches.keys(),
  ]);
  await Promise.all(registrations
    .filter((registration) => registration.active?.scriptURL.endsWith("/sw.js"))
    .map((registration) => registration.unregister()));
  await Promise.all(cacheNames
    .filter((name) => name.startsWith("plan0-offline-"))
    .map((name) => caches.delete(name)));
}

export function OfflineResilienceProvider({ children }: { children: ReactNode }) {
  const connectionStatus = useSyncExternalStore(
    subscribeToConnectionStatus,
    getConnectionStatus,
    () => "online" as ConnectionStatus,
  );

  const synchronizeHouseholdSnapshot = useCallback(() => {
    try {
      postToActiveWorker({
        type: "CACHE_HOUSEHOLD_SNAPSHOT",
        savedAt: new Date().toISOString(),
        data: householdSnapshot(),
      });
    } catch {
      // Storage may be unavailable; the app remains usable for the current visit.
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void removeDevelopmentOfflineCache();
      return;
    }

    let disposed = false;
    const synchronizeWhenControlled = () => {
      if (disposed) return;
      cacheCurrentPageResources();
      synchronizeHouseholdSnapshot();
    };

    navigator.serviceWorker.addEventListener("controllerchange", synchronizeWhenControlled);
    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    }).then((registration) => {
      if (registration.active) synchronizeWhenControlled();
      void navigator.serviceWorker.ready.then(synchronizeWhenControlled);
    }).catch(() => {
      // Service workers are unavailable in some private browsing and embedded contexts.
    });

    HOUSEHOLD_CHANGE_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, synchronizeHouseholdSnapshot);
    });
    window.addEventListener("storage", synchronizeHouseholdSnapshot);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", synchronizeWhenControlled);
      HOUSEHOLD_CHANGE_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, synchronizeHouseholdSnapshot);
      });
      window.removeEventListener("storage", synchronizeHouseholdSnapshot);
    };
  }, [synchronizeHouseholdSnapshot]);

  return (
    <OfflineResilienceContext.Provider value={{ connectionStatus }}>
      {children}
    </OfflineResilienceContext.Provider>
  );
}

export function useOfflineResilience() {
  const context = useContext(OfflineResilienceContext);
  if (!context) {
    throw new Error("useOfflineResilience must be used within OfflineResilienceProvider.");
  }
  return context;
}
