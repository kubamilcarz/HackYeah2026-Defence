"use client";

import { AccessibilityPreferencesControls } from "@/components/accessibility/AccessibilityPreferencesControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export default function AccessibilitySettingsPage() {
  const { messages } = useLocalization();
  const copy = messages.accessibility;
  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel={messages.common.backToSettings} title={copy.title} />
      <div className="settings-page__content settings-page__content--detail">
        <h1 className="sr-only">{copy.title}</h1>
        <div className="settings-page__preferences">
          <AccessibilityPreferencesControls layout="settings" />
        </div>
      </div>
    </main>
  );
}
