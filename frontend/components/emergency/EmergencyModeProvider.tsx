"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "plan-0-emergency-mode-active";
const CHANGE_EVENT = "plan-0-emergency-mode-change";

let inMemoryState = false;

function getStoredState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return inMemoryState;
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export type EmergencyModeContextValue = {
  activateEmergency: () => void;
  deactivateEmergency: () => void;
  isEmergencyActive: boolean;
  toggleEmergency: () => void;
};

const EmergencyModeContext = createContext<EmergencyModeContextValue | null>(null);

export function EmergencyModeProvider({ children }: { children: ReactNode }) {
  const isEmergencyActive = useSyncExternalStore(
    subscribe,
    getStoredState,
    () => false,
  );

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isEmergencyActive) {
        root.dataset.emergencyMode = "active";
      } else {
        delete root.dataset.emergencyMode;
      }
    } catch {
      // Ignored if DOM not ready
    }
  }, [isEmergencyActive]);

  const setEmergencyState = useCallback((active: boolean) => {
    inMemoryState = active;
    try {
      if (typeof window !== "undefined") {
        if (active) {
          window.localStorage.setItem(STORAGE_KEY, "true");
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const activateEmergency = useCallback(() => setEmergencyState(true), [setEmergencyState]);
  const deactivateEmergency = useCallback(() => setEmergencyState(false), [setEmergencyState]);
  const toggleEmergency = useCallback(() => setEmergencyState(!getStoredState()), [setEmergencyState]);

  const value = useMemo(
    () => ({
      activateEmergency,
      deactivateEmergency,
      isEmergencyActive,
      toggleEmergency,
    }),
    [activateEmergency, deactivateEmergency, isEmergencyActive, toggleEmergency],
  );

  return (
    <EmergencyModeContext.Provider value={value}>
      {children}
    </EmergencyModeContext.Provider>
  );
}

export function useEmergencyMode() {
  const context = useContext(EmergencyModeContext);
  if (!context) {
    throw new Error("useEmergencyMode must be used within an EmergencyModeProvider");
  }
  return context;
}
