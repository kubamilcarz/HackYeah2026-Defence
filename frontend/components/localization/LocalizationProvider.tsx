"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getDeviceLocale,
  isLocale,
  messages,
  type Locale,
  type Messages,
} from "@/localization/messages";

type LocalizationContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "plan-0-locale";
const CHANGE_EVENT = "plan-0-locale-change";

let clientLocale: Locale | null = null;

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function getStoredLocale(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(storedLocale) ? storedLocale : getDeviceLocale();
  } catch {
    return getDeviceLocale();
  }
}

function getClientLocale(): Locale {
  if (!clientLocale) clientLocale = getStoredLocale();
  return clientLocale;
}

function subscribeToLocale(onStoreChange: () => void) {
  const synchronizeStoredLocale = () => {
    clientLocale = getStoredLocale();
    onStoreChange();
  };

  window.addEventListener("storage", synchronizeStoredLocale);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", synchronizeStoredLocale);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function storeLocale(locale: Locale) {
  clientLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Keep the current tab usable if browser storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getClientLocale,
    () => DEFAULT_LOCALE,
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    storeLocale(nextLocale);
  }, []);

  const value = useMemo(
    () => ({ locale, messages: messages[locale], setLocale }),
    [locale, setLocale],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider.");
  }
  return context;
}
