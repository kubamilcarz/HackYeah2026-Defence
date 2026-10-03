"use client";

import { ArrowRight, Warning, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEmergencyMode } from "@/components/emergency/EmergencyModeProvider";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function EmergencyTopBar() {
  const pathname = usePathname();
  const { deactivateEmergency, isEmergencyActive } = useEmergencyMode();
  const { messages } = useLocalization();

  if (!isEmergencyActive || pathname === "/crisis" || pathname === "/emergency") {
    return null;
  }

  const copy = messages.crisisMode.activeBanner;

  return (
    <aside aria-label={copy.ariaLabel} className="emergency-top-bar" role="alert">
      <div className="emergency-top-bar__status">
        <span aria-hidden="true" className="emergency-top-bar__pulse" />
        <Warning aria-hidden="true" size={20} weight="fill" />
        <span className="emergency-top-bar__status-text">{copy.title}</span>
      </div>
      <div className="emergency-top-bar__actions">
        <Link
          aria-label={copy.openMenu}
          className="emergency-top-bar__link"
          href="/crisis"
          title={copy.openMenu}
        >
          <span className="emergency-top-bar__btn-label">{copy.openMenu}</span>
          <ArrowRight aria-hidden="true" size={18} weight="bold" />
        </Link>
        <button
          aria-label={copy.exit}
          className="emergency-top-bar__exit-btn"
          onClick={deactivateEmergency}
          title={copy.exit}
          type="button"
        >
          <X aria-hidden="true" size={18} weight="bold" />
          <span className="emergency-top-bar__btn-label">{copy.exit}</span>
        </button>
      </div>
    </aside>
  );
}
