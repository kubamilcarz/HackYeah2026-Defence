import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Settings" };

type SettingsLink = {
  href: string;
  icon: Icon;
  label: string;
};

const settingsSections: Array<{ id: string; items: SettingsLink[]; title: string }> = [
  {
    id: "account-and-app",
    title: "Account & app",
    items: [
      { href: "/settings/profile", icon: User, label: "My profile" },
      { href: "/settings/notifications", icon: Bell, label: "Notifications" },
      { href: "/settings/preferences", icon: Gear, label: "Preferences" },
      { href: "/settings/language", icon: Globe, label: "Language" },
      { href: "/settings/about", icon: Info, label: "About PLAN:0" },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { href: "/settings/guides", icon: BookOpenText, label: "Guides" },
      { href: "/settings/important-numbers", icon: Phone, label: "Important numbers" },
      { href: "/settings/announcements-alerts", icon: ShieldWarning, label: "Announcements & alerts" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <main className="settings-page">
      <PageNavigationBar title="Settings" />
      <div className="settings-page__content">
        <h1 className="sr-only">Settings</h1>
        <nav aria-label="Settings pages" className="settings-page__sections">
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
            <h2 className="type-h2 settings-page__section-heading" id="accessibility-heading">Accessibility</h2>
            <ul className="settings-page__list">
              <li>
                <Link className="settings-page__link" href="/settings/accessibility">
                  <span className="settings-page__link-label">
                    <AccessibilityIcon className="settings-page__accessibility-icon" />
                    <span>Accessibility settings</span>
                  </span>
                  <CaretRight aria-hidden="true" size={20} weight="bold" />
                </Link>
              </li>
            </ul>
          </section>
        </nav>
        <footer className="settings-page__footer">
          <div className="settings-page__app-icon">
            <Image alt="" height={64} src="/brand/logo-icon.svg" width={64} />
          </div>
          <div className="settings-page__app-details">
            <p className="type-h3">PLAN:0</p>
            <p className="type-caption">© 2026 Na Wszelki</p>
            <p className="type-caption">Made for HackYeah 2026.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
