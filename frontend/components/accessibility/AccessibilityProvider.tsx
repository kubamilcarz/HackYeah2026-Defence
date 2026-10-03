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

export const TEXT_SCALES = [25, 50, 75, 100, 112.5, 125, 150, 175, 200] as const;

export type TextScale = (typeof TEXT_SCALES)[number];

export const APPEARANCE_PREFERENCES = [
  "system",
  "light",
  "dark",
  "hc-black-white",
  "hc-black-yellow",
  "grayscale",
] as const;

export type AppearancePreference = (typeof APPEARANCE_PREFERENCES)[number];

export type AccessibilityPreferences = {
  appearance: AppearancePreference;
  textScale: TextScale;
  underlineLinks: boolean;
};

type AccessibilityContextValue = AccessibilityPreferences & {
  setAppearance: (appearance: AppearancePreference) => void;
  setTextScale: (textScale: TextScale) => void;
  setUnderlineLinks: (underlineLinks: boolean) => void;
  resetTextScale: () => void;
  resetSettings: () => void;
};

const STORAGE_KEY = "plan-0-accessibility-preferences";
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  appearance: "system",
  textScale: 100,
  underlineLinks: false,
};
const CHANGE_EVENT = "plan-0-accessibility-preferences-change";

let clientPreferences: AccessibilityPreferences | null = null;

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

function isAppearancePreference(value: unknown): value is AppearancePreference {
  return (
    typeof value === "string" &&
    APPEARANCE_PREFERENCES.includes(value as AppearancePreference)
  );
}

function isTextScale(value: unknown): value is TextScale {
  return typeof value === "number" && TEXT_SCALES.includes(value as TextScale);
}

function getStoredPreferences(): AccessibilityPreferences {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_PREFERENCES;

    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_PREFERENCES;

    const preferences = parsed as Partial<AccessibilityPreferences>;
    return {
      appearance: isAppearancePreference(preferences.appearance)
        ? preferences.appearance
        : DEFAULT_PREFERENCES.appearance,
      textScale: isTextScale(preferences.textScale)
        ? preferences.textScale
        : DEFAULT_PREFERENCES.textScale,
      underlineLinks:
        typeof preferences.underlineLinks === "boolean"
          ? preferences.underlineLinks
          : DEFAULT_PREFERENCES.underlineLinks,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function getClientPreferences() {
  if (!clientPreferences) clientPreferences = getStoredPreferences();
  return clientPreferences;
}

function subscribeToPreferences(onStoreChange: () => void) {
  const synchronizePreferences = () => {
    clientPreferences = getStoredPreferences();
    onStoreChange();
  };

  window.addEventListener("storage", synchronizePreferences);
  window.addEventListener(CHANGE_EVENT, synchronizePreferences);

  return () => {
    window.removeEventListener("storage", synchronizePreferences);
    window.removeEventListener(CHANGE_EVENT, synchronizePreferences);
  };
}

function storePreferences(preferences: AccessibilityPreferences) {
  clientPreferences = preferences;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function resolveTheme(appearance: AppearancePreference) {
  if (appearance !== "system") return appearance;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(preferences.appearance);

  root.dataset.theme = resolvedTheme;
  root.dataset.textScale = String(preferences.textScale);
  root.dataset.underlineLinks = String(preferences.underlineLinks);
  root.style.colorScheme =
    resolvedTheme === "dark" || resolvedTheme.startsWith("hc-")
      ? "dark"
      : "light";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const preferences = useSyncExternalStore(
    subscribeToPreferences,
    getClientPreferences,
    () => DEFAULT_PREFERENCES,
  );

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (preferences.appearance !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => applyPreferences(preferences);

    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [preferences]);

  const setAppearance = useCallback((appearance: AppearancePreference) => {
    storePreferences({ ...getClientPreferences(), appearance });
  }, []);

  const setTextScale = useCallback((textScale: TextScale) => {
    storePreferences({ ...getClientPreferences(), textScale });
  }, []);

  const setUnderlineLinks = useCallback((underlineLinks: boolean) => {
    storePreferences({ ...getClientPreferences(), underlineLinks });
  }, []);

  const resetTextScale = useCallback(() => {
    setTextScale(DEFAULT_PREFERENCES.textScale);
  }, [setTextScale]);

  const resetSettings = useCallback(() => {
    storePreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      setAppearance,
      setTextScale,
      setUnderlineLinks,
      resetTextScale,
      resetSettings,
    }),
    [
      preferences,
      resetSettings,
      resetTextScale,
      setAppearance,
      setTextScale,
      setUnderlineLinks,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityPreferences() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibilityPreferences must be used within AccessibilityProvider.",
    );
  }

  return context;
}
