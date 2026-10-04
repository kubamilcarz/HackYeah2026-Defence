"use client";
import { useState } from "react";
import {
  Bell,
  BookOpenText,
  CaretRight,
  Database,
  Globe,
  Phone,
  ShieldWarning,
  Trash,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react/lib";
import Image from "next/image";
import Link from "next/link";
import { AccessibilityIcon } from "@/components/accessibility/AccessibilityIcon";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmergencyModeCard } from "@/components/ui/EmergencyModeCard";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { clearAllOfflineData } from "@/lib/db";

type SettingsLink = {
  href: string;
  icon: Icon;
  label: string;
};

export default function SettingsPage() {
  const { messages } = useLocalization();
  const copy = messages.settings;
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const accountSection = {
    id: "account-and-app",
    items: [
      { href: "/settings/notifications", icon: Bell, label: copy.notifications },
      { href: "/settings/language", icon: Globe, label: copy.language },
    ],
    title: copy.accountAndApp,
  };
  const resourcesSection = {
    id: "resources",
    items: [
      { href: "/settings/guides", icon: BookOpenText, label: copy.guides },
      { href: "/settings/important-numbers", icon: Phone, label: copy.importantNumbers },
      { href: "/settings/announcements-alerts", icon: ShieldWarning, label: copy.announcementsAlerts },
    ],
    title: copy.resources,
  };

  async function handleConfirmClear() {
    setIsClearing(true);
    try {
      await clearAllOfflineData();
      setIsClearDialogOpen(false);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 4000);
    } catch (error) {
      console.error("Failed to clear offline storage:", error);
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <main className="settings-page">
      <PageNavigationBar title={copy.title} />
      <div className="settings-page__content settings-page__content--overview">
        <h1 className="sr-only">{copy.title}</h1>
        <header className="settings-page__hero">
          <div className="settings-page__hero-copy">
            <p className="type-caption settings-page__eyebrow">PLAN:0</p>
            <p className="type-h1">{copy.title}</p>
            <p className="type-body settings-page__hero-description">{copy.madeFor}</p>
          </div>
          <div aria-hidden="true" className="settings-page__hero-mark">
            <Image alt="" height={64} src="/brand/logo-icon.svg" width={64} />
          </div>
        </header>
        <nav aria-label={copy.pagesLabel} className="settings-page__sections">
          <section aria-labelledby={`${accountSection.id}-heading`} className="settings-page__section">
            <h2 className="type-h2 settings-page__section-heading" id={`${accountSection.id}-heading`}>{accountSection.title}</h2>
            <ul className="settings-page__list">
              {accountSection.items.map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <Link className="settings-page__link" href={href}>
                    <span className="settings-page__link-label">
                      <Icon aria-hidden="true" className="settings-page__link-icon" size={28} />
                      <span>{label}</span>
                    </span>
                    <CaretRight aria-hidden="true" size={20} weight="bold" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <EmergencyModeCard />

          <section aria-labelledby={`${resourcesSection.id}-heading`} className="settings-page__section">
            <h2 className="type-h2 settings-page__section-heading" id={`${resourcesSection.id}-heading`}>{resourcesSection.title}</h2>
            <ul className="settings-page__list">
              {resourcesSection.items.map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <Link className="settings-page__link" href={href}>
                    <span className="settings-page__link-label">
                      <Icon aria-hidden="true" className="settings-page__link-icon" size={28} />
                      <span>{label}</span>
                    </span>
                    <CaretRight aria-hidden="true" size={20} weight="bold" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="accessibility-heading" className="settings-page__section">
            <h2 className="type-h2 settings-page__section-heading" id="accessibility-heading">{copy.accessibility}</h2>
            <ul className="settings-page__list">
              <li>
                <Link className="settings-page__link" href="/settings/accessibility">
                  <span className="settings-page__link-label">
                    <AccessibilityIcon className="settings-page__accessibility-icon" />
                    <span>{copy.accessibility}</span>
                  </span>
                  <CaretRight aria-hidden="true" size={20} weight="bold" />
                </Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="storage-heading" className="settings-page__section">
            <h2 className="type-h2 settings-page__section-heading" id="storage-heading">{copy.dataAndStorage}</h2>
            <div className="settings-page__storage-card">
              <div className="settings-page__storage-content">
                <Database aria-hidden="true" className="settings-page__storage-icon" size={28} />
                <div className="settings-page__storage-info">
                  <p className="type-body font-semibold">{copy.storageDescription}</p>
                  {clearedNotice && (
                    <p aria-live="polite" className="type-caption text-[var(--action-primary)] font-medium mt-1">
                      {copy.clearSuccess}
                    </p>
                  )}
                </div>
              </div>
              <Button
                aria-label={copy.clearStorageAria}
                className="settings-page__clear-button"
                leadingIcon={Trash}
                onClick={() => setIsClearDialogOpen(true)}
                variant="destructive"
              >
                {copy.clearStorage}
              </Button>
            </div>
          </section>
        </nav>

        <Dialog
          closeLabel={copy.clearDialogCancel}
          description={copy.clearDialogDescription}
          onOpenChange={setIsClearDialogOpen}
          open={isClearDialogOpen}
          title={copy.clearDialogTitle}
        >
          <div className="dialog__actions">
            <Button
              disabled={isClearing}
              onClick={() => setIsClearDialogOpen(false)}
              variant="secondary"
            >
              {copy.clearDialogCancel}
            </Button>
            <Button
              disabled={isClearing}
              leadingIcon={Trash}
              onClick={handleConfirmClear}
              variant="destructive"
            >
              {copy.clearDialogConfirm}
            </Button>
          </div>
        </Dialog>

        <footer className="settings-page__footer">
          <p className="type-caption">© 2026 Na Wszelki</p>
        </footer>
      </div>
    </main>
  );
}
