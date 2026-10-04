"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import {
  getNotificationPreferencesServerSnapshot,
  getNotificationPreferencesSnapshot,
  saveNotificationPreferences,
  subscribeToNotificationPreferences,
  type NotificationPreferences,
} from "@/components/app/notification-preferences";

type NotificationPermissionState = NotificationPermission | "unsupported";

const NOTIFICATION_PERMISSION_CHANGE_EVENT = "plan-0-notification-permission-change";

function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function getBrowserNotificationPermissionServer(): NotificationPermissionState {
  return "unsupported";
}

function subscribeToNotificationPermission(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(NOTIFICATION_PERMISSION_CHANGE_EVENT, onStoreChange);

  let permissionStatus: PermissionStatus | null = null;
  if ("permissions" in navigator && typeof navigator.permissions.query === "function") {
    navigator.permissions
      .query({ name: "notifications" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        status.onchange = () => {
          onStoreChange();
        };
      })
      .catch(() => {});
  }

  return () => {
    window.removeEventListener(NOTIFICATION_PERMISSION_CHANGE_EVENT, onStoreChange);
    if (permissionStatus) {
      permissionStatus.onchange = null;
    }
  };
}

export function NotificationSettingsScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.notificationSettings;

  const preferences = useSyncExternalStore(
    subscribeToNotificationPreferences,
    getNotificationPreferencesSnapshot,
    getNotificationPreferencesServerSnapshot,
  );

  const permission = useSyncExternalStore(
    subscribeToNotificationPermission,
    getBrowserNotificationPermission,
    getBrowserNotificationPermissionServer,
  );

  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleRequestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      await Notification.requestPermission();
      window.dispatchEvent(new Event(NOTIFICATION_PERMISSION_CHANGE_EVENT));
    } catch {
      // Permission request was dismissed or failed
    }
  }

  function handleToggle(channel: keyof NotificationPreferences) {
    const next: NotificationPreferences = {
      ...preferences,
      [channel]: !preferences[channel],
    };
    saveNotificationPreferences(next);
  }

  function handleSendTest() {
    if (permission === "unsupported") {
      setFeedback(copy.testUnsupported);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (permission !== "granted") {
      setFeedback(copy.testBlocked);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    try {
      new Notification(copy.testNotificationTitle, {
        body: copy.testNotificationBody,
        icon: "/brand/logo-icon.svg",
      });
      setFeedback(copy.testSuccess);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback(copy.testBlocked);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <main className="settings-page" lang={locale}>
      <PageNavigationBar
        backHref="/settings"
        backLabel={messages.common.backToSettings}
        title={copy.title}
      />
      <div className="settings-page__content settings-page__content--detail notification-settings-content">
        <h1 className="sr-only">{copy.title}</h1>

        {/* Browser Permission */}
        {permission === "default" && (
          <section aria-labelledby="notification-permission-heading" className="notification-permission-card">
            <div className="notification-permission-card__info">
              <h2 className="type-h3" id="notification-permission-heading">{copy.browserNotifications}</h2>
              <p className="type-caption text-[var(--content-muted)]">{copy.browserNotificationsDescription}</p>
            </div>
            <Button onClick={handleRequestPermission} variant="primary">
              {copy.enableNotifications}
            </Button>
          </section>
        )}

        {permission === "granted" && (
          <div className="notification-permission-card">
            <div className="notification-permission-card__info">
              <p className="type-body font-medium">{copy.notificationsEnabled}</p>
              <p className="type-caption text-[var(--content-muted)]">{copy.browserNotificationsDescription}</p>
            </div>
            <Button onClick={handleSendTest} variant="secondary">
              {copy.testButton}
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <Alert
            description={copy.notificationsBlocked}
            title={copy.notificationsBlockedTitle}
            variant="warning"
          />
        )}

        {permission === "unsupported" && (
          <Alert
            description={copy.unsupported}
            title={copy.unsupportedTitle}
            variant="info"
          />
        )}

        {/* Channels */}
        <section aria-labelledby="notification-channels-heading" className="notification-channels-section">
          <h2 className="type-h3 font-semibold" id="notification-channels-heading">
            {copy.channelsHeading}
          </h2>

          <ul className="notification-channels-list">
            <li className="notification-channel-item">
              <label className="notification-channel-item__label" htmlFor="channel-official-alerts">
                <span className="type-body font-medium">{copy.officialAlertsTitle}</span>
                <span className="type-caption text-[var(--content-muted)]">{copy.officialAlertsDescription}</span>
              </label>
              <label className="accessibility-switch">
                <span className="sr-only">{copy.officialAlertsTitle}</span>
                <input
                  checked={preferences.officialAlerts}
                  id="channel-official-alerts"
                  onChange={() => handleToggle("officialAlerts")}
                  role="switch"
                  type="checkbox"
                />
                <span aria-hidden="true" className="accessibility-switch-track" />
              </label>
            </li>

            <li className="notification-channel-item">
              <label className="notification-channel-item__label" htmlFor="channel-supply-reminders">
                <span className="type-body font-medium">{copy.supplyRemindersTitle}</span>
                <span className="type-caption text-[var(--content-muted)]">{copy.supplyRemindersDescription}</span>
              </label>
              <label className="accessibility-switch">
                <span className="sr-only">{copy.supplyRemindersTitle}</span>
                <input
                  checked={preferences.supplyReminders}
                  id="channel-supply-reminders"
                  onChange={() => handleToggle("supplyReminders")}
                  role="switch"
                  type="checkbox"
                />
                <span aria-hidden="true" className="accessibility-switch-track" />
              </label>
            </li>

            <li className="notification-channel-item">
              <label className="notification-channel-item__label" htmlFor="channel-plan-review">
                <span className="type-body font-medium">{copy.planReviewRemindersTitle}</span>
                <span className="type-caption text-[var(--content-muted)]">{copy.planReviewRemindersDescription}</span>
              </label>
              <label className="accessibility-switch">
                <span className="sr-only">{copy.planReviewRemindersTitle}</span>
                <input
                  checked={preferences.planReviewReminders}
                  id="channel-plan-review"
                  onChange={() => handleToggle("planReviewReminders")}
                  role="switch"
                  type="checkbox"
                />
                <span aria-hidden="true" className="accessibility-switch-track" />
              </label>
            </li>
          </ul>
        </section>

        {/* Limitations & Fallback Note */}
        <p className="type-caption text-[var(--content-muted)] leading-relaxed">
          {copy.deliveryNote}
        </p>

        {feedback && (
          <p aria-live="polite" className="sr-only" role="status">
            {feedback}
          </p>
        )}
      </div>
    </main>
  );
}
