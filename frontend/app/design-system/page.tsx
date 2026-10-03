import type { Metadata } from "next";
import {
  Ambulance,
  FireExtinguisher,
  FirstAidKit,
  Lifebuoy,
  MapPin,
  Phone,
  Radio,
  ShieldWarning,
  Siren,
  Warning,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react/lib";

export const metadata: Metadata = {
  title: "Design system | 72H",
  description: "The 72H interface design system.",
};

const sections = [
  ["01 / Color", "Foundations", "foundations"],
  ["02 / Typography", "Readable by default", "type"],
  ["03 / Actions & inputs", "Components", "components"],
  ["04 / Status", "Feedback", "feedback"],
  ["05 / Iconography", "Emergency reference", "icons"],
] as const;

const typeStyles = [
  ["H1", "Page heading", "Bold", "32 / 40", "type-h1"],
  ["H2", "Section title", "Semibold", "20 / 28", "type-h2"],
  ["H3", "Subheading", "Semibold", "16 / 24", "type-h3"],
  ["Body", "Body text", "Regular", "16 / 24", "type-body"],
  ["Caption", "Supporting text", "Regular", "14 / 20", "type-caption"],
] as const;

const emergencyIcons: { name: string; use: string; Icon: Icon }[] = [
  { name: "Siren", use: "Active emergency or urgent alert", Icon: Siren },
  { name: "Warning", use: "Hazard or important caution", Icon: Warning },
  { name: "FirstAidKit", use: "First aid and medical supplies", Icon: FirstAidKit },
  { name: "Ambulance", use: "Medical response or transport", Icon: Ambulance },
  { name: "FireExtinguisher", use: "Fire safety equipment", Icon: FireExtinguisher },
  { name: "ShieldWarning", use: "Safety issue or protective action", Icon: ShieldWarning },
  { name: "Phone", use: "Call emergency services", Icon: Phone },
  { name: "MapPin", use: "Incident location or meeting point", Icon: MapPin },
  { name: "Radio", use: "Emergency communications", Icon: Radio },
  { name: "Lifebuoy", use: "Rescue or support", Icon: Lifebuoy },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-canvas)] px-5 py-6 text-[var(--content-primary)] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 grid gap-8 border-b border-[var(--border-strong)] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--content-link)]">
              72H / Foundations
            </p>
            <h1 className="type-h1 max-w-3xl">
              Design system
            </h1>
          </div>
          <nav aria-label="Design system sections" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
            {sections.map(([, title, id]) => (
              <a href={`#${id}`} key={id}>{title}</a>
            ))}
          </nav>
        </header>

        {sections.map(([eyebrow, title, id]) => (
          <section className="min-h-52 scroll-mt-8 border-t border-[var(--border-subtle)] py-10 sm:min-h-64 sm:py-14" id={id} key={id}>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--content-muted)]">
              {eyebrow}
            </p>
            <h2 className="type-h2">{title}</h2>
            {id === "type" && (
              <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)]">
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] border-b border-[var(--border-subtle)] px-5 py-6 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_5rem] sm:items-center sm:gap-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--content-muted)]">Scale</span>
                  <p className="type-caption text-[var(--content-muted)]">Cross-platform · Inter / geometric sans</p>
                  <span className="hidden sm:block" />
                  <span className="hidden sm:block" />
                </div>
                {typeStyles.map(([token, name, weight, metrics, className]) => (
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] border-b border-[var(--border-subtle)] px-5 py-5 last:border-b-0 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_5rem] sm:items-center sm:gap-4" key={token}>
                    <span className="font-mono text-sm font-semibold text-[var(--content-muted)]">{token}</span>
                    <p className={className}>{name}</p>
                    <span className="type-caption mt-1 text-[var(--content-muted)] sm:mt-0">{weight}</span>
                    <span className="type-caption text-[var(--content-muted)]">{metrics}</span>
                  </div>
                ))}
              </div>
            )}
            {id === "icons" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <p className="type-caption mb-6 max-w-2xl text-[var(--content-muted)]">
                  Phosphor icons for emergency-related actions and status. Pair every production icon with an explicit text label or accessible name; do not use color alone to convey urgency.
                </p>
                <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
                  {emergencyIcons.map(({ name, use, Icon }) => (
                    <div className="flex items-center gap-4 bg-[var(--surface-raised)] p-4" key={name}>
                      <Icon aria-hidden="true" size={28} weight="duotone" />
                      <div>
                        <p className="type-h3">{name}</p>
                        <p className="type-caption text-[var(--content-muted)]">{use}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
