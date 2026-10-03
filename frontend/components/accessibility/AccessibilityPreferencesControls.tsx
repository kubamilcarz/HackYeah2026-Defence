"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import {
  APPEARANCE_PREFERENCES,
  TEXT_SCALES,
  type AppearancePreference,
  type TextScale,
  useAccessibilityPreferences,
} from "./AccessibilityProvider";
import { useLocalization } from "@/components/localization/LocalizationProvider";

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupport() {
  return "speechSynthesis" in window;
}

function getServerSpeechSupport() {
  return false;
}

type AccessibilityPreferencesControlsProps = {
  layout?: "compact" | "settings";
};

export function AccessibilityPreferencesControls({
  layout = "compact",
}: AccessibilityPreferencesControlsProps) {
  const { messages } = useLocalization();
  const copy = messages.accessibility;
  const appearanceLabels: Record<AppearancePreference, string> = {
    system: copy.appearance.system, light: copy.appearance.light, dark: copy.appearance.dark,
    "hc-black-white": copy.appearance.hcBlackWhite, "hc-black-yellow": copy.appearance.hcBlackYellow, grayscale: copy.appearance.grayscale,
  };
  const {
    appearance,
    textScale,
    setAppearance,
    setTextScale,
    setUnderlineLinks,
    underlineLinks,
    resetTextScale,
    resetSettings,
  } = useAccessibilityPreferences();
  const isSpeechSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupport,
    getServerSpeechSupport,
  );
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(copy.readyToRead);
  const appearanceName = useId();
  const textScaleIndex = TEXT_SCALES.indexOf(textScale);
  const canDecrease = textScaleIndex > 0;
  const canIncrease = textScaleIndex < TEXT_SCALES.length - 1;

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function decreaseTextSize() {
    if (canDecrease) setTextScale(TEXT_SCALES[textScaleIndex - 1] as TextScale);
  }

  function increaseTextSize() {
    if (canIncrease) setTextScale(TEXT_SCALES[textScaleIndex + 1] as TextScale);
  }

  function toggleReadAloud() {
    if (!isSpeechSupported) return;

    if (isReading) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setSpeechStatus(copy.reading);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setSpeechStatus(copy.readingPaused);
      }
      return;
    }

    const readableContent = document.querySelector("main")?.textContent?.trim();
    if (!readableContent) {
      setSpeechStatus(copy.noReadableContent);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(readableContent);
    utterance.lang = document.documentElement.lang || "en";
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setSpeechStatus(copy.finishedReading);
    };
    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setSpeechStatus(copy.readUnavailable);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
    setSpeechStatus(copy.reading);
  }

  function stopReading() {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setSpeechStatus(copy.stopReading);
  }

  const isSettingsLayout = layout === "settings";
  const sectionHeadingClassName = isSettingsLayout
    ? "type-h2 accessibility-settings-section__heading"
    : "sr-only";

  return (
    <div className={`accessibility-preferences-controls accessibility-preferences-controls--${layout}`}>
      <section aria-labelledby={`${appearanceName}-display`} className="accessibility-settings-section">
        <header className="accessibility-settings-section__header">
          <h2 className={sectionHeadingClassName} id={`${appearanceName}-display`}>{copy.display}</h2>
          {isSettingsLayout && <p className="type-caption accessibility-settings-section__description">{copy.displayDescription}</p>}
        </header>
        <div className="accessibility-settings-section__controls">
          <fieldset className="accessibility-fieldset">
            <legend className="sr-only">{copy.displayMode}</legend>
            <div className="accessibility-options">
              {APPEARANCE_PREFERENCES.map((option) => (
                <label className="accessibility-option" key={option}>
                  <input checked={appearance === option} name={appearanceName} onChange={() => setAppearance(option)} type="radio" value={option} />
                  <span>{appearanceLabels[option]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section aria-labelledby={`${appearanceName}-text-size`} className="accessibility-settings-section">
        <header className="accessibility-settings-section__header">
          <h2 className={sectionHeadingClassName} id={`${appearanceName}-text-size`}>{copy.textSize}</h2>
          {isSettingsLayout && <p className="type-caption accessibility-settings-section__description">{copy.textSizeDescription}</p>}
        </header>
        <div className="accessibility-settings-section__controls">
          <div className="accessibility-text-controls">
          <button aria-label={copy.decreaseTextSize} className="accessibility-text-action" disabled={!canDecrease} onClick={decreaseTextSize} type="button">
            <span aria-hidden="true">A−</span>
            <span className="sr-only">{copy.decreaseTextSize}</span>
          </button>
          <output aria-atomic="true" aria-live="polite" className="accessibility-text-value">
            <span aria-hidden="true" className="accessibility-text-preview">Aa</span>
            <span>{copy.textSizeValue.replace("{value}", String(textScale))}</span>
          </output>
          <button aria-label={copy.increaseTextSize} className="accessibility-text-action" disabled={!canIncrease} onClick={increaseTextSize} type="button">
            <span aria-hidden="true">A+</span>
            <span className="sr-only">{copy.increaseTextSize}</span>
          </button>
          </div>
          <button className="accessibility-reset" disabled={textScale === 100} onClick={resetTextScale} type="button">
            {copy.resetTextSize}
          </button>
        </div>
      </section>

      <section aria-labelledby={`${appearanceName}-links`} className="accessibility-settings-section">
        <header className="accessibility-settings-section__header">
          <h2 className={sectionHeadingClassName} id={`${appearanceName}-links`}>{copy.links}</h2>
          {isSettingsLayout && <p className="type-caption accessibility-settings-section__description">{copy.linksDescription}</p>}
        </header>
        <div className="accessibility-settings-section__controls">
          <label className="accessibility-switch">
            <span><strong>{copy.underlineLinks}</strong></span>
            <input checked={underlineLinks} onChange={(event) => setUnderlineLinks(event.target.checked)} role="switch" type="checkbox" />
            <span aria-hidden="true" className="accessibility-switch-track" />
          </label>
        </div>
      </section>

      <section aria-labelledby={`${appearanceName}-read-aloud`} className="accessibility-settings-section">
        <header className="accessibility-settings-section__header">
          <h2 className={sectionHeadingClassName} id={`${appearanceName}-read-aloud`}>{copy.readAloud}</h2>
          {isSettingsLayout && <p className="type-caption accessibility-settings-section__description">{copy.readAloudDescription}</p>}
        </header>
        <div className="accessibility-settings-section__controls">
          <section aria-label={copy.readAloud} className="accessibility-read-aloud">
            <div className="accessibility-read-actions">
              <button disabled={!isSpeechSupported} onClick={toggleReadAloud} type="button">
                {isReading && !isPaused ? (
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
                ) : (
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z" /></svg>
                )}
                <span>{isReading ? (isPaused ? copy.resume : copy.pause) : copy.readThisPage}</span>
              </button>
              <button aria-label={copy.stopReading} disabled={!isReading} onClick={stopReading} type="button">
                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><rect height="12" rx="1" width="12" x="6" y="6" /></svg>
                <span>{copy.stop}</span>
              </button>
            </div>
            <p aria-atomic="true" aria-live="polite" className="accessibility-status sr-only">
              {isSpeechSupported ? speechStatus : copy.readUnsupported}
            </p>
          </section>
        </div>
      </section>

      <section aria-labelledby={`${appearanceName}-reset`} className="accessibility-settings-section">
        <header className="accessibility-settings-section__header">
          <h2 className={sectionHeadingClassName} id={`${appearanceName}-reset`}>{copy.reset}</h2>
          {isSettingsLayout && <p className="type-caption accessibility-settings-section__description">{copy.resetDescription}</p>}
        </header>
        <div className="accessibility-settings-section__controls">
          <button className="accessibility-reset-settings" onClick={resetSettings} type="button">
            <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            <span>{copy.resetSettings}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
