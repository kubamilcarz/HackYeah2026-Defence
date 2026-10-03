"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";

export type TagVariant = "neutral" | "success" | "info" | "warning" | "danger";

type SharedTagProps = {
  className?: string;
  label: string;
  variant?: TagVariant;
};

export type TagProps = SharedTagProps & {
  removable?: boolean;
  removeLabel?: string;
};

export function Tag({
  className,
  label,
  removable = false,
  removeLabel = `Remove ${label}`,
  variant = "neutral",
}: TagProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <span className={`tag tag--${variant}${className ? ` ${className}` : ""}`}>
      <span>{label}</span>
      {removable && (
        <button aria-label={removeLabel} className="tag__remove" onClick={() => setIsVisible(false)} type="button">
          <X aria-hidden="true" size={16} weight="bold" />
        </button>
      )}
    </span>
  );
}

export function Badge({ className, label, variant = "neutral" }: SharedTagProps) {
  return <span className={`badge badge--${variant}${className ? ` ${className}` : ""}`}>{label}</span>;
}
