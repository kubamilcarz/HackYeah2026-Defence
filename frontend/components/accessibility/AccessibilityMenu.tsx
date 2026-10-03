"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  APPEARANCE_PREFERENCES,
  TEXT_SCALES,
  type AppearancePreference,
  type TextScale,
  useAccessibilityPreferences,
} from "./AccessibilityProvider";

const appearanceLabels: Record<AppearancePreference, string> = {
  system: "Use device setting",
  light: "Light",
  dark: "Dark",
  "hc-black-white": "High contrast — black / white",
  "hc-black-yellow": "High contrast — black / yellow",
  grayscale: "Grayscale",
};

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupport() {
  return "speechSynthesis" in window;
}

function getServerSpeechSupport() {
  return false;
}

export function AccessibilityMenu() {
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
  const [isOpen, setIsOpen] = useState(false);
  const isSpeechSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupport,
    getServerSpeechSupport,
  );
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("Ready to read this page aloud.");
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();
  const textScaleIndex = TEXT_SCALES.indexOf(textScale);
  const canDecrease = textScaleIndex > 0;
  const canIncrease = textScaleIndex < TEXT_SCALES.length - 1;

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const focusSelectedAppearance = () => {
      rootRef.current
        ?.querySelector<HTMLInputElement>(
          'input[name="accessibility-appearance"]:checked',
        )
        ?.focus();
    };
    const frame = window.requestAnimationFrame(focusSelectedAppearance);
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  function closeAndRestoreFocus() {
    setIsOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }

  function handleLauncherClick() {
    if (isOpen) {
      closeAndRestoreFocus();
    } else {
      setIsOpen(true);
    }
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestoreFocus();
    }
  }

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
        setSpeechStatus("Reading this page aloud.");
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setSpeechStatus("Reading paused.");
      }
      return;
    }

    const readableContent = document.querySelector("main")?.textContent?.trim();
    if (!readableContent) {
      setSpeechStatus("No readable page content was found.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(readableContent);
    utterance.lang = document.documentElement.lang || "en";
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setSpeechStatus("Finished reading this page.");
    };
    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setSpeechStatus("Read aloud is unavailable right now.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
    setSpeechStatus("Reading this page aloud.");
  }

  function stopReading() {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setSpeechStatus("Read aloud stopped.");
  }

  return (
    <div className="accessibility-control" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label="Accessibility preferences"
        className="accessibility-launcher"
        onClick={handleLauncherClick}
        ref={launcherRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="accessibility-launcher-icon"
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="4.5" r="2.25" />
          <path d="M3.5 9h17" />
          <path d="M12 9v6" />
          <path d="m7.5 21 4.5-6 4.5 6" />
        </svg>
        <span>Accessibility</span>
      </button>

      {isOpen ? (
        <section
          aria-labelledby={titleId}
          className="accessibility-panel"
          id={panelId}
          onKeyDown={handlePanelKeyDown}
          role="dialog"
        >
          <div className="accessibility-panel-header">
            <h2 id={titleId}>Accessibility</h2>
            <button
              aria-label="Close accessibility preferences"
              className="accessibility-close"
              onClick={closeAndRestoreFocus}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <fieldset className="accessibility-fieldset">
            <legend className="sr-only">Display mode</legend>
            <div className="accessibility-options">
              {APPEARANCE_PREFERENCES.map((option) => (
                <label className="accessibility-option" key={option}>
                  <input
                    checked={appearance === option}
                    name="accessibility-appearance"
                    onChange={() => setAppearance(option)}
                    type="radio"
                    value={option}
                  />
                  <span>{appearanceLabels[option]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <section aria-label="Text size">
            <div className="accessibility-text-controls">
              <button
                aria-label="Decrease text size"
                className="accessibility-text-action"
                disabled={!canDecrease}
                onClick={decreaseTextSize}
                type="button"
              >
                <span aria-hidden="true">A−</span>
                <span className="sr-only">Decrease text size</span>
              </button>
              <output aria-atomic="true" aria-live="polite" className="accessibility-text-value">
                <span aria-hidden="true" className="accessibility-text-preview">
                  Aa
                </span>
                <span>Text size: {textScale}%</span>
              </output>
              <button
                aria-label="Increase text size"
                className="accessibility-text-action"
                disabled={!canIncrease}
                onClick={increaseTextSize}
                type="button"
              >
                <span aria-hidden="true">A+</span>
                <span className="sr-only">Increase text size</span>
              </button>
            </div>
            <button
              className="accessibility-reset"
              disabled={textScale === 100}
              onClick={resetTextScale}
              type="button"
            >
              Reset text size
            </button>
          </section>

          <label className="accessibility-switch">
            <span>
              <strong>Underline links</strong>
            </span>
            <input
              checked={underlineLinks}
              onChange={(event) => setUnderlineLinks(event.target.checked)}
              role="switch"
              type="checkbox"
            />
            <span aria-hidden="true" className="accessibility-switch-track" />
          </label>

          <section aria-label="Read aloud" className="accessibility-read-aloud">
            <div className="accessibility-read-actions">
              <button
                disabled={!isSpeechSupported}
                onClick={toggleReadAloud}
                type="button"
              >
                {isReading && !isPaused ? (
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m8 5 11 7-11 7z" />
                  </svg>
                )}
                <span>{isReading ? (isPaused ? "Resume" : "Pause") : "Read this page"}</span>
              </button>
              <button aria-label="Stop reading" disabled={!isReading} onClick={stopReading} type="button">
                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <rect height="12" rx="1" width="12" x="6" y="6" />
                </svg>
                <span>Stop</span>
              </button>
            </div>
            <p aria-atomic="true" aria-live="polite" className="accessibility-status sr-only">
              {isSpeechSupported ? speechStatus : "Read aloud is not supported by this browser."}
            </p>
          </section>

          <button className="accessibility-reset-settings" onClick={resetSettings} type="button">
            <svg
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            <span>Reset settings</span>
          </button>
        </section>
      ) : null}
    </div>
  );
}
