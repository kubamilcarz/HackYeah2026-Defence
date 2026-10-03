"use client";

import { useState } from "react";
import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

export type FeedbackVariant = "success" | "info" | "warning" | "danger";

type FeedbackProps = {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description: string;
  dismissLabel?: string;
  dismissible?: boolean;
  title: string;
  variant?: FeedbackVariant;
};

const feedbackIcons = {
  success: CheckCircle,
  info: Info,
  warning: Warning,
  danger: WarningCircle,
} as const;

function DismissButton({ label, onDismiss }: { label: string; onDismiss: () => void }) {
  return (
    <button aria-label={label} className="feedback__dismiss" onClick={onDismiss} type="button">
      <X aria-hidden="true" size={20} weight="bold" />
    </button>
  );
}

export function Alert({
  actionHref,
  actionLabel,
  className,
  description,
  dismissLabel = "Dismiss notification",
  dismissible = false,
  title,
  variant = "info",
}: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = feedbackIcons[variant];

  if (!isVisible) return null;

  return (
    <div
      aria-live={variant === "danger" ? "assertive" : "polite"}
      className={`feedback feedback--alert feedback--${variant}${className ? ` ${className}` : ""}`}
      role={variant === "danger" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="feedback__icon" size={24} weight="fill" />
      <div className="feedback__content">
        <p className="feedback__title">{title}</p>
        <p className="feedback__description">{description}</p>
        {actionHref && actionLabel && <a className="feedback__action" href={actionHref}>{actionLabel}</a>}
      </div>
      {dismissible && <DismissButton label={dismissLabel} onDismiss={() => setIsVisible(false)} />}
    </div>
  );
}

export function Banner({
  actionHref,
  actionLabel,
  className,
  description,
  dismissLabel = "Dismiss banner",
  dismissible = false,
  title,
  variant = "info",
}: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = feedbackIcons[variant];

  if (!isVisible) return null;

  return (
    <section aria-label={title} className={`feedback feedback--banner feedback--${variant}${className ? ` ${className}` : ""}`}>
      <Icon aria-hidden="true" className="feedback__icon" size={28} weight="fill" />
      <div className="feedback__content">
        <h3 className="feedback__title">{title}</h3>
        <p className="feedback__description">{description}</p>
        {actionHref && actionLabel && <a className="feedback__action" href={actionHref}>{actionLabel}</a>}
      </div>
      {dismissible && <DismissButton label={dismissLabel} onDismiss={() => setIsVisible(false)} />}
    </section>
  );
}
