"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AccessibilityIcon } from "./AccessibilityIcon";
import { AccessibilityPreferencesControls } from "./AccessibilityPreferencesControls";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function AccessibilityMenu() {
  const { messages } = useLocalization();
  const copy = messages.accessibility;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const focusSelectedAppearance = () => {
      rootRef.current
        ?.querySelector<HTMLInputElement>('input[type="radio"]:checked')
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

  if (pathname === "/settings/accessibility") return null;

  return (
    <div className="accessibility-control" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={copy.launcher}
        className="accessibility-launcher"
        onClick={handleLauncherClick}
        ref={launcherRef}
        type="button"
      >
        <AccessibilityIcon className="accessibility-launcher-icon" />
        <span>{copy.title}</span>
      </button>

      <section
        aria-labelledby={titleId}
        className="accessibility-panel"
        hidden={!isOpen}
        id={panelId}
        onKeyDown={handlePanelKeyDown}
        role="dialog"
      >
        <div className="accessibility-panel-header">
          <h2 id={titleId}>{copy.title}</h2>
          <button
            aria-label={copy.close}
            className="accessibility-close"
            onClick={closeAndRestoreFocus}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <AccessibilityPreferencesControls />
      </section>
    </div>
  );
}
