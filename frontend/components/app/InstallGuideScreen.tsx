"use client";

import { Browser, DeviceMobile, DownloadSimple } from "@phosphor-icons/react/ssr";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function InstallGuideScreen() {
  const { messages } = useLocalization();
  const copy = messages.installGuide;

  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel={messages.common.backToSettings} title={copy.title} />
      <div className="settings-page__content settings-page__content--detail install-guide">
        <header className="install-guide__hero">
          <div className="install-guide__hero-icon"><DownloadSimple aria-hidden="true" size={28} weight="bold" /></div>
          <div>
            <h1 className="type-h1">{copy.title}</h1>
            <p className="type-body install-guide__intro">{copy.description}</p>
          </div>
        </header>
        <div className="install-guide__platforms">
          <section aria-labelledby="install-guide-ios" className="install-guide__section">
            <header className="install-guide__section-header">
              <div aria-hidden="true" className="install-guide__section-icon"><DeviceMobile size={24} weight="bold" /></div>
              <h2 className="type-h2" id="install-guide-ios">{copy.ios.title}</h2>
            </header>
            <ol className="install-guide__steps type-body">
              {copy.ios.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
          <section aria-labelledby="install-guide-android" className="install-guide__section">
            <header className="install-guide__section-header">
              <div aria-hidden="true" className="install-guide__section-icon"><DeviceMobile size={24} weight="bold" /></div>
              <h2 className="type-h2" id="install-guide-android">{copy.android.title}</h2>
            </header>
            <ol className="install-guide__steps type-body">
              {copy.android.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        </div>
        <section aria-labelledby="install-guide-other" className="install-guide__other">
          <Browser aria-hidden="true" className="install-guide__other-icon" size={24} weight="bold" />
          <div>
            <h2 className="type-h3" id="install-guide-other">{copy.other.title}</h2>
            <p className="type-body">{copy.other.description}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
