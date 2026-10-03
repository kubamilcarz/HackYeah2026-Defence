"use client";

import { useSyncExternalStore } from "react";
import { Alert } from "@/components/ui/Alert";
import { useLocalization } from "@/components/localization/LocalizationProvider";

const DISMISSAL_KEY = "plan-0-install-reminder-dismissed";
const CHANGE_EVENT = "plan-0-install-reminder-change";

let dismissedInMemory = false;

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function getInstallReminderVisibility() {
  if (typeof window === "undefined" || isStandalone() || dismissedInMemory) return false;

  try {
    return window.localStorage.getItem(DISMISSAL_KEY) !== "true";
  } catch {
    return true;
  }
}

function subscribeToInstallReminder(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function InstallReminder() {
  const { messages } = useLocalization();
  const isVisible = useSyncExternalStore(
    subscribeToInstallReminder,
    getInstallReminderVisibility,
    () => false,
  );

  if (!isVisible) return null;

  const copy = messages.installReminder;
  return (
    <Alert
      actionHref="/settings/guides"
      actionLabel={copy.action}
      className="app-shell__install-reminder"
      description={copy.description}
      dismissLabel={copy.dismiss}
      dismissible
      onDismiss={() => {
        dismissedInMemory = true;
        try {
          window.localStorage.setItem(DISMISSAL_KEY, "true");
        } catch {
          // The reminder remains dismissible for this visit when storage is unavailable.
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }}
      title={copy.title}
      variant="info"
    />
  );
}
