"use client";
import {
  Bell,
  BookOpenText,
  CaretRight,
  Gear,
  Globe,
  Info,
  Phone,
  ShieldWarning,
  User,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react/lib";
import Image from "next/image";
import Link from "next/link";
import { AccessibilityIcon } from "@/components/accessibility/AccessibilityIcon";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";

type SettingsLink = {
  href: string;
  icon: Icon;
  label: string;
};

export default function SettingsPage() {
  const { messages } = useLocalization();
  const copy = messages.settings;
  const settingsSections: Array<{ id: string; items: SettingsLink[]; title: string }> = [
    { id: "account-and-app", title: copy.accountAndApp, items: [{ href: "/settings/profile", icon: User, label: copy.profile }, { href: "/settings/notifications", icon: Bell, label: copy.notifications }, { href: "/settings/preferences", icon: Gear, label: copy.preferences }, { href: "/settings/language", icon: Globe, label: copy.language }, { href: "/settings/about", icon: Info, label: copy.about }] },
    { id: "resources", title: copy.resources, items: [{ href: "/settings/guides", icon: BookOpenText, label: copy.guides }, { href: "/settings/important-numbers", icon: Phone, label: copy.importantNumbers }, { href: "/settings/announcements-alerts", icon: ShieldWarning, label: copy.announcementsAlerts }] },
  ];
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
          {settingsSections.map(({ id, items, title }) => (
            <section aria-labelledby={`${id}-heading`} className="settings-page__section" key={id}>
              <h2 className="type-h2 settings-page__section-heading" id={`${id}-heading`}>{title}</h2>
              <ul className="settings-page__list">
                {items.map(({ href, icon: Icon, label }) => (
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
          ))}
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
        </nav>
        <footer className="settings-page__footer">
          <p className="type-caption">© 2026 Na Wszelki</p>
        </footer>
      </div>
    </main>
  );
}
