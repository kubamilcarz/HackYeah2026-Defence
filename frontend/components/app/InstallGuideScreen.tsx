"use client";

import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function InstallGuideScreen() {
  const { messages } = useLocalization();
  const copy = messages.installGuide;

  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel={messages.common.backToSettings} title={copy.title} />
      <div className="settings-page__content settings-page__content--detail install-guide">
        <h1 className="type-h1">{copy.title}</h1>
        <p className="type-body install-guide__intro">{copy.description}</p>
        <section aria-labelledby="install-guide-ios" className="install-guide__section">
          <h2 className="type-h2" id="install-guide-ios">{copy.ios.title}</h2>
          <ol className="install-guide__steps type-body">
            {copy.ios.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>
        <section aria-labelledby="install-guide-android" className="install-guide__section">
          <h2 className="type-h2" id="install-guide-android">{copy.android.title}</h2>
          <ol className="install-guide__steps type-body">
            {copy.android.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>
        <section aria-labelledby="install-guide-other" className="install-guide__section">
          <h2 className="type-h2" id="install-guide-other">{copy.other.title}</h2>
          <p className="type-body">{copy.other.description}</p>
        </section>
      </div>
    </main>
  );
}
