"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CheckCircle, Info, Warning, WarningCircle, X } from "@phosphor-icons/react";
import type { FeedbackVariant } from "@/components/ui/Alert";

export type ToastProps = {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description: string;
  dismissLabel?: string;
  duration?: number;
  onDismiss: () => void;
  title: string;
  variant?: FeedbackVariant;
};

const toastIcons = {
  success: CheckCircle,
  info: Info,
  warning: Warning,
  danger: WarningCircle,
} as const;

/**
 * A brief, non-blocking status update. Mount it inside a ToastViewport and
 * provide `onDismiss` so the owning feature controls its lifetime.
 */
export function Toast({
  actionHref,
  actionLabel,
  className,
  description,
  dismissLabel = "Dismiss notification",
  duration = 6000,
  onDismiss,
  title,
  variant = "info",
}: ToastProps) {
  const Icon = toastIcons[variant];

  useEffect(() => {
    if (duration <= 0) return;

    const timeout = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onDismiss]);

  return (
    <article
      aria-atomic="true"
      aria-live={variant === "danger" ? "assertive" : "polite"}
      className={`feedback feedback--toast feedback--${variant}${className ? ` ${className}` : ""}`}
      role={variant === "danger" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="feedback__icon" size={24} weight="fill" />
      <div className="feedback__content">
        <p className="feedback__title">{title}</p>
        <p className="feedback__description">{description}</p>
        {actionHref && actionLabel && <a className="feedback__action" href={actionHref}>{actionLabel}</a>}
      </div>
      <button aria-label={dismissLabel} className="feedback__dismiss" onClick={onDismiss} type="button">
        <X aria-hidden="true" size={20} weight="bold" />
      </button>
    </article>
  );
}

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Notifications" className="toast-viewport">
      {children}
    </section>
  );
}
