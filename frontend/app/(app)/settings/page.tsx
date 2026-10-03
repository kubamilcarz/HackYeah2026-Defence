import type { Metadata } from "next";
import { CaretRight } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { AccessibilityIcon } from "@/components/accessibility/AccessibilityIcon";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="settings-page">
      <PageNavigationBar title="Settings" />
      <div className="settings-page__content">
        <h1 className="sr-only">Settings</h1>
        <nav aria-label="Settings pages">
          <ul className="settings-page__list">
            <li>
              <Link className="settings-page__link" href="/settings/accessibility">
                <span className="settings-page__link-label">
                  <AccessibilityIcon className="settings-page__accessibility-icon" />
                  <span>Accessibility</span>
                </span>
                <CaretRight aria-hidden="true" size={20} weight="bold" />
              </Link>
            </li>
          </ul>
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
