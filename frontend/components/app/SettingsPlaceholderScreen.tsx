"use client";

import { useLocalization } from "@/components/localization/LocalizationProvider";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import type { Messages } from "@/localization/messages";

type SettingsPlaceholderScreenProps = {
  page: keyof Messages["placeholders"];
};

export function SettingsPlaceholderScreen({ page }: SettingsPlaceholderScreenProps) {
  const { messages } = useLocalization();
  const copy = messages.placeholders[page];

  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel={messages.common.backToSettings} title={copy.title} />
      <div className="settings-page__content settings-page__content--detail settings-page__placeholder">
        <h1 className="type-h1">{copy.title}</h1>
        <p className="type-body settings-page__placeholder-description">{copy.description}</p>
        <p className="type-caption settings-page__placeholder-status" role="status">{messages.common.comingSoon}</p>
      </div>
    </main>
  );
}
