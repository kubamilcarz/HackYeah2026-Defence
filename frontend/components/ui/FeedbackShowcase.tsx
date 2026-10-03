"use client";

import { useState } from "react";
import { CheckCircle, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast, ToastViewport } from "@/components/ui/Toast";

type ToastItem = { id: number; title: string; description: string; variant: "success" | "info" | "warning" | "danger" };

export function FeedbackShowcase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function addToast() {
    const id = Date.now();
    setToasts((current) => [...current, {
      id,
      title: "Plan saved",
      description: "Your emergency plan is available offline.",
      variant: "success",
    }]);
  }

  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <section className="mt-10" aria-labelledby="toasts-dialogs-heading">
      <div className="mb-4">
        <h3 className="type-h3" id="toasts-dialogs-heading">Toasts &amp; dialogs</h3>
        <p className="type-caption mt-1 text-[var(--content-muted)]">Toasts confirm a completed action without interrupting work. Dialogs require an explicit decision; use them sparingly, especially for destructive actions.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="type-h3">Toast</h4>
          <p className="type-caption mt-1 text-[var(--content-muted)]">Dismissible and automatically removed after six seconds.</p>
          <Button className="mt-4" leadingIcon={CheckCircle} onClick={addToast}>Save plan</Button>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="type-h3">Confirmation dialog</h4>
          <p className="type-caption mt-1 text-[var(--content-muted)]">Escape, the close button, or the backdrop cancels and returns focus to the trigger.</p>
          <Button className="mt-4" leadingIcon={Trash} onClick={() => setIsDialogOpen(true)} variant="destructive">Delete plan</Button>
        </div>
      </div>

      <ToastViewport>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </ToastViewport>

      <Dialog
        description="This removes the plan and its offline copy. This action cannot be undone."
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        title="Delete this emergency plan?"
      >
        <div className="dialog__actions">
          <Button onClick={() => setIsDialogOpen(false)} variant="secondary">Cancel</Button>
          <Button onClick={() => setIsDialogOpen(false)} variant="destructive">Delete plan</Button>
        </div>
      </Dialog>
    </section>
  );
}
