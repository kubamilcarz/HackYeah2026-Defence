import type { Metadata } from "next";
import { AccessibilityPreferencesControls } from "@/components/accessibility/AccessibilityPreferencesControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilitySettingsPage() {
  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel="Back to Settings" title="Accessibility" />
      <div className="settings-page__content settings-page__content--detail">
        <h1 className="sr-only">Accessibility</h1>
        <div className="settings-page__preferences">
          <AccessibilityPreferencesControls layout="settings" />
        </div>
      </div>
    </main>
  );
}
