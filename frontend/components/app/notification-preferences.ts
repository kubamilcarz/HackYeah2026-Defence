export type NotificationPreferences = {
  officialAlerts: boolean;
  supplyReminders: boolean;
  planReviewReminders: boolean;
};

export const NOTIFICATION_SETTINGS_STORAGE_KEY = "plan-0-notification-settings-v1";
export const NOTIFICATION_SETTINGS_CHANGE_EVENT = "plan-0-notification-settings-change";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  officialAlerts: true,
  supplyReminders: true,
  planReviewReminders: true,
};

let cachedPreferences: NotificationPreferences | null = null;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!isObject(raw)) return { ...DEFAULT_NOTIFICATION_PREFERENCES };

  return {
    officialAlerts: typeof raw.officialAlerts === "boolean" ? raw.officialAlerts : DEFAULT_NOTIFICATION_PREFERENCES.officialAlerts,
    supplyReminders: typeof raw.supplyReminders === "boolean" ? raw.supplyReminders : DEFAULT_NOTIFICATION_PREFERENCES.supplyReminders,
    planReviewReminders: typeof raw.planReviewReminders === "boolean" ? raw.planReviewReminders : DEFAULT_NOTIFICATION_PREFERENCES.planReviewReminders,
  };
}

export function getNotificationPreferencesSnapshot(): NotificationPreferences {
  if (cachedPreferences) return cachedPreferences;

  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
    if (!raw) {
      cachedPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
      return cachedPreferences;
    }
    const parsed: unknown = JSON.parse(raw);
    cachedPreferences = parseNotificationPreferences(parsed);
    return cachedPreferences;
  } catch {
    cachedPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
    return cachedPreferences;
  }
}

export function getNotificationPreferencesServerSnapshot(): NotificationPreferences {
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function subscribeToNotificationPreferences(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedPreferences = null;
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(NOTIFICATION_SETTINGS_CHANGE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(NOTIFICATION_SETTINGS_CHANGE_EVENT, handleUpdate);
  };
}

export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  cachedPreferences = preferences;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage unavailable fallback
    }
    window.dispatchEvent(new Event(NOTIFICATION_SETTINGS_CHANGE_EVENT));
  }
}
