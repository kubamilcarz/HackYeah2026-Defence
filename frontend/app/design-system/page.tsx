import type { Metadata } from "next";
import {
  Ambulance,
  ArrowRight,
  FireExtinguisher,
  FirstAidKit,
  Lifebuoy,
  MapPin,
  Phone,
  Radio,
  ShieldWarning,
  Siren,
  Trash,
  Warning,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react/lib";
import { Button, IconButton } from "@/components/ui/Button";

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

const spacingTokens = [
  ["1", "4px", "--space-1"],
  ["2", "8px", "--space-2"],
  ["3", "12px", "--space-3"],
  ["4", "16px", "--space-4"],
  ["5", "20px", "--space-5"],
  ["6", "24px", "--space-6"],
  ["8", "32px", "--space-8"],
  ["10", "40px", "--space-10"],
  ["12", "48px", "--space-12"],
  ["16", "64px", "--space-16"],
] as const;

const colorGroups = [
  {
    name: "Surfaces",
    tokens: [
      ["Canvas", "--surface-canvas"],
      ["Raised", "--surface-raised"],
      ["Subtle", "--surface-subtle"],
      ["Inverse", "--surface-inverse"],
    ],
  },
  {
    name: "Content & borders",
    tokens: [
      ["Primary", "--content-primary"],
      ["Secondary", "--content-secondary"],
      ["Muted", "--content-muted"],
      ["Link", "--content-link"],
      ["Strong border", "--border-strong"],
    ],
  },
  {
    name: "Actions",
    tokens: [
      ["Primary", "--action-primary"],
      ["Primary hover", "--action-primary-hover"],
      ["Primary pressed", "--action-primary-pressed"],
      ["Destructive", "--action-danger"],
      ["Destructive hover", "--action-danger-hover"],
      ["Focus ring", "--focus-ring"],
    ],
  },
  {
    name: "Feedback",
    tokens: [
      ["Success", "--feedback-success-foreground"],
      ["Warning", "--feedback-warning-foreground"],
      ["Danger", "--feedback-danger-foreground"],
      ["Information", "--feedback-info-foreground"],
    ],
  },
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

const buttonExamples: { label: string; variant: "primary" | "secondary" | "tertiary" | "destructive"; Icon: Icon }[] = [
  { label: "Request help", variant: "primary", Icon: Siren },
  { label: "View safe route", variant: "secondary", Icon: MapPin },
  { label: "Save for later", variant: "tertiary", Icon: ArrowRight },
  { label: "Delete report", variant: "destructive", Icon: Trash },
];

const iconButtonExamples: { label: string; variant: "primary" | "secondary" | "tertiary" | "destructive"; Icon: Icon }[] = [
  { label: "Call emergency services", variant: "primary", Icon: Phone },
  { label: "Show incident location", variant: "secondary", Icon: MapPin },
  { label: "Open emergency communications", variant: "tertiary", Icon: Radio },
  { label: "Delete report", variant: "destructive", Icon: Trash },
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
            {id === "foundations" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <p className="type-caption mb-6 max-w-2xl text-[var(--content-muted)]">
                  Use semantic color and spacing tokens in components, never raw values. Color responds to the active appearance setting; spacing remains consistent across appearances.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  {colorGroups.map(({ name, tokens }) => (
                    <section key={name} aria-labelledby={`${name.toLowerCase().replaceAll(" ", "-")}-colors`}>
                      <h3 className="type-h3 mb-3" id={`${name.toLowerCase().replaceAll(" ", "-")}-colors`}>{name}</h3>
                      <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                        {tokens.map(([label, token]) => (
                          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] p-3 last:border-b-0" key={token}>
                            <span
                              aria-hidden="true"
                              className="h-10 w-10 shrink-0 rounded-md border border-[var(--border-strong)]"
                              style={{ backgroundColor: `var(${token})` }}
                            />
                            <div className="min-w-0">
                              <p className="type-caption font-semibold text-[var(--content-primary)]">{label}</p>
                              <code className="break-all font-mono text-xs text-[var(--content-muted)]">{token}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <section className="mt-8" aria-labelledby="spacing-heading">
                  <div className="mb-3">
                    <h3 className="type-h3" id="spacing-heading">Spacing</h3>
                    <p className="type-caption mt-1 text-[var(--content-muted)]">A 4px base scale for layout, component padding, and gaps. Use the next suitable token instead of one-off values.</p>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                    <div className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] gap-3 border-b border-[var(--border-subtle)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--content-muted)] sm:grid-cols-[5rem_minmax(0,1fr)_5rem]">
                      <span>Token</span>
                      <span>Reference</span>
                      <span>Value</span>
                    </div>
                    {spacingTokens.map(([scale, value, token]) => (
                      <div className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0 sm:grid-cols-[5rem_minmax(0,1fr)_5rem]" key={token}>
                        <code className="font-mono text-xs text-[var(--content-muted)]">{scale}</code>
                        <div className="flex h-4 items-center">
                          <span aria-hidden="true" className="block h-4 rounded-sm bg-[var(--action-primary)]" style={{ width: `var(${token})` }} />
                          <code className="ml-3 font-mono text-xs text-[var(--content-muted)]">{token}</code>
                        </div>
                        <span className="type-caption text-[var(--content-muted)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
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
            {id === "components" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <p className="type-caption max-w-2xl text-[var(--content-muted)]">
                  Use a button for an in-place action and an anchor for navigation. Every action uses a 48px target, visible keyboard focus, and native disabled behavior.
                </p>

                <div className="mt-8 grid gap-8">
                  <section aria-labelledby="text-buttons-heading">
                    <div className="mb-4">
                      <h3 className="type-h3" id="text-buttons-heading">Text buttons</h3>
                      <p className="type-caption mt-1 text-[var(--content-muted)]">Use primary once per decision point; use destructive only for irreversible actions.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {buttonExamples.map(({ label, variant, Icon }) => (
                        <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4" key={variant}>
                          <code className="font-mono text-xs text-[var(--content-muted)]">{variant}</code>
                          <Button leadingIcon={Icon} variant={variant}>{label}</Button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section aria-labelledby="icon-buttons-heading">
                    <div className="mb-4">
                      <h3 className="type-h3" id="icon-buttons-heading">Icon buttons</h3>
                      <p className="type-caption mt-1 text-[var(--content-muted)]">Use only when the action is familiar; each icon has a required accessible name.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {iconButtonExamples.map(({ label, variant, Icon }) => (
                        <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4" key={variant}>
                          <code className="font-mono text-xs text-[var(--content-muted)]">{variant}</code>
                          <IconButton icon={Icon} label={label} variant={variant} />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section aria-labelledby="button-states-heading">
                    <div className="mb-4">
                      <h3 className="type-h3" id="button-states-heading">Interaction states</h3>
                      <p className="type-caption mt-1 text-[var(--content-muted)]">Hover and pressed samples are visual references. Tab to an interactive control to verify the real focus treatment.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4">
                        <code className="font-mono text-xs text-[var(--content-muted)]">default</code>
                        <Button>Request help</Button>
                      </div>
                      <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4">
                        <code className="font-mono text-xs text-[var(--content-muted)]">hover</code>
                        <Button className="button--preview-hover">Request help</Button>
                      </div>
                      <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4">
                        <code className="font-mono text-xs text-[var(--content-muted)]">pressed</code>
                        <Button className="button--preview-pressed">Request help</Button>
                      </div>
                      <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4">
                        <code className="font-mono text-xs text-[var(--content-muted)]">focus</code>
                        <Button className="button--preview-focus">Request help</Button>
                      </div>
                      <div className="flex min-h-28 flex-col items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-4">
                        <code className="font-mono text-xs text-[var(--content-muted)]">disabled</code>
                        <Button disabled>Request help</Button>
                      </div>
                    </div>
                  </section>
                </div>
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
