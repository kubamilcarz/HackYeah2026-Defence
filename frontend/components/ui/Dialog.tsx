"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";

export type DialogProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

/**
 * A controlled modal dialog. The native dialog element provides modal focus
 * handling; callers own the open state and choose the dialog actions.
 */
export function Dialog({
  children,
  className,
  closeLabel = "Close dialog",
  description,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-dialog-initial-focus]")?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
      previouslyFocusedElement.current?.focus();
      previouslyFocusedElement.current = null;
    }
  }, [open]);

  function requestClose() {
    onOpenChange(false);
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`dialog${className ? ` ${className}` : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      ref={dialogRef}
    >
      <div className="dialog__surface">
        <div className="dialog__header">
          <div>
            <h2 className="dialog__title" id={titleId}>{title}</h2>
            {description && <p className="dialog__description" id={descriptionId}>{description}</p>}
          </div>
          <button aria-label={closeLabel} className="dialog__close" data-dialog-initial-focus onClick={requestClose} type="button">
            <X aria-hidden="true" size={20} weight="bold" />
          </button>
        </div>
        <div className="dialog__body">{children}</div>
      </div>
    </dialog>
  );
}
