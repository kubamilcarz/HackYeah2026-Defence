"use client";

import { useId } from "react";
import Link from "next/link";
import { ArrowRight, Warning } from "@phosphor-icons/react";
import { useEmergencyMode } from "@/components/emergency/EmergencyModeProvider";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export type EmergencyModeCardProps = {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description?: string;
  onActivate?: () => void;
  title?: string;
};

export function EmergencyModeCard({
  actionHref = "/crisis",
  actionLabel,
  className,
  description,
  onActivate,
  title,
}: EmergencyModeCardProps) {
  const headingId = useId();
  const { activateEmergency, isEmergencyActive } = useEmergencyMode();
  const { messages } = useLocalization();
  const copy = messages.crisisMode;

  function handleClick() {
    activateEmergency();
    if (onActivate) {
      onActivate();
    }
  }

  const cardTitle = title ?? copy.title;
  const cardDescription = description ?? copy.description;
  const cardAction = actionLabel ?? (isEmergencyActive ? copy.activeCardAction : copy.action);

  return (
    <section
      aria-labelledby={headingId}
      className={`emergency-mode-card${className ? ` ${className}` : ""}`}
    >
      <div className="emergency-mode-card__content">
        <Warning aria-hidden="true" className="emergency-mode-card__icon" size={36} weight="fill" />
        <div className="emergency-mode-card__copy">
          <h2 className="emergency-mode-card__title" id={headingId}>
            {cardTitle}
          </h2>
          <p className="emergency-mode-card__description">
            {cardDescription}
          </p>
        </div>
      </div>
      {actionHref ? (
        <Link
          className="emergency-mode-card__button"
          href={actionHref}
          onClick={handleClick}
        >
          <span>{cardAction}</span>
          <ArrowRight aria-hidden="true" size={20} weight="bold" />
        </Link>
      ) : (
        <button
          className="emergency-mode-card__button"
          onClick={handleClick}
          type="button"
        >
          <span>{cardAction}</span>
          <ArrowRight aria-hidden="true" size={20} weight="bold" />
        </button>
      )}
    </section>
  );
}

export const CrisisModeCard = EmergencyModeCard;
