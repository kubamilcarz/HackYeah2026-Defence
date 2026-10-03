"use client";

import { useLocalization } from "@/components/localization/LocalizationProvider";
import { RadioGroup } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { isLocale } from "@/localization/messages";

const languageOptions = [
  { value: "en", label: <span lang="en">English</span> },
  { value: "pl", label: <span lang="pl">Polski</span> },
] as const;

export function LanguageSettingsScreen() {
  const { locale, messages, setLocale } = useLocalization();
  const copy = messages.languageSettings;

  return (
    <main className="settings-page" lang={locale}>
      <PageNavigationBar
        backHref="/settings"
        backLabel={copy.backLabel}
        title={copy.heading}
      />
      <div className="settings-page__content settings-page__content--detail">
        <h1 className="sr-only">{copy.heading}</h1>
        <RadioGroup
          className="language-settings__choices"
          label={copy.legend}
          name="language"
          onValueChange={(value) => {
            if (isLocale(value)) setLocale(value);
          }}
          options={languageOptions}
          value={locale}
        />
      </div>
    </main>
  );
}
