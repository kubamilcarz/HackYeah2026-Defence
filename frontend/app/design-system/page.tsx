import type { Metadata } from "next";
import Image from "next/image";
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
import { Alert, Banner } from "@/components/ui/Alert";
import { ControlsShowcase } from "@/components/ui/ControlsShowcase";
import { DataTable } from "@/components/ui/DataTable";
import { FeedbackShowcase } from "@/components/ui/FeedbackShowcase";
import { NavigationShowcase } from "@/components/ui/NavigationShowcase";
import { CircularProgress, LinearProgress } from "@/components/ui/Progress";
import { Badge, Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Design system",
  description: "The Plan: 0 interface design system.",
};

const sections = [
  ["01 / Color", "Foundations", "foundations"],
  ["02 / Typography", "Readable by default", "type"],
  ["03 / Actions & inputs", "Components", "components"],
  ["04 / Status", "Feedback", "feedback"],
  ["05 / Navigation", "Navigation", "navigation"],
  ["06 / Iconography", "Emergency reference", "icons"],
  ["07 / Brand", "Logo assets", "brand"],
] as const;

const appearanceVariants = [
  { name: "Light", asset: "/brand/logo-color.svg", background: "#ffffff", filter: "none" },
  { name: "Dark", asset: "/brand/logo-white.svg", background: "#0a0a0a", filter: "none" },
  { name: "Black / white", asset: "/brand/logo-white.svg", background: "#000000", filter: "none" },
  { name: "Black / yellow", asset: "/brand/logo-white.svg", background: "#000000", filter: "var(--brand-yellow-filter)" },
  { name: "Grayscale", asset: "/brand/logo-color.svg", background: "#ffffff", filter: "grayscale(1)" },
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

const supplyRows = [
  { id: "water", supply: "Water reserve", available: "18 / 24 L", status: "Ready" },
  { id: "food", supply: "Food reserve", available: "6 / 14 days", status: "Needs review" },
  { id: "first-aid", supply: "First aid kit", available: "Complete", status: "Ready" },
  { id: "flashlight", supply: "Flashlight batteries", available: "2 / 4 sets", status: "Restock" },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-canvas)] px-5 py-6 text-[var(--content-primary)] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 grid gap-8 border-b border-[var(--border-strong)] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--content-link)]">
              Plan: 0 / Foundations
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

                  <section aria-labelledby="tags-badges-heading">
                    <div className="mb-4">
                      <h3 className="type-h3" id="tags-badges-heading">Tags &amp; badges</h3>
                      <p className="type-caption mt-1 text-[var(--content-muted)]">Tags classify or filter content and may be removable. Badges add compact status, category, or count context beside a label.</p>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="type-h3">Tags</h4>
                          <code className="font-mono text-xs text-[var(--content-muted)]">removable</code>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Tag label="Family plan" />
                          <Tag label="Medical" variant="info" />
                          <Tag label="Prepared" variant="success" />
                          <Tag label="Needs review" variant="warning" removable />
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="type-h3">Badges</h4>
                          <code className="font-mono text-xs text-[var(--content-muted)]">status / count</code>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="type-caption">Saved plans <Badge label="3" variant="info" /></span>
                          <span className="type-caption">Ready <Badge label="Complete" variant="success" /></span>
                          <span className="type-caption">Supply list <Badge label="2" variant="warning" /></span>
                          <span className="type-caption">Reports <Badge label="New" variant="danger" /></span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section aria-labelledby="data-table-heading">
                    <div className="mb-4 max-w-2xl">
                      <h3 className="type-h3" id="data-table-heading">Data table</h3>
                      <p className="type-caption mt-1 text-[var(--content-muted)]">Use tables for comparable records. Enable sorting only for columns where order is useful, and include search when people need to find a record quickly.</p>
                    </div>
                    <DataTable
                      columns={[
                        { key: "supply", label: "Supply", sortable: true },
                        { key: "available", label: "Available", sortable: true },
                        { key: "status", label: "Status", sortable: true },
                      ]}
                      heading="Emergency supply readiness"
                      rowKey="id"
                      rows={supplyRows}
                      searchLabel="Search emergency supplies"
                    />
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
                  <ControlsShowcase />
                </div>
              </div>
            )}
            {id === "feedback" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <div className="max-w-2xl">
                  <p className="type-caption text-[var(--content-muted)]">
                    Alerts confirm a local action or surface a concise status. Banners carry broader, persistent context. Pair every state with an icon and clear copy, and reserve interruptive alerts for errors that need immediate attention.
                  </p>
                </div>

                <section className="mt-8" aria-labelledby="alerts-heading">
                  <div className="mb-4">
                    <h3 className="type-h3" id="alerts-heading">Alerts</h3>
                    <p className="type-caption mt-1 text-[var(--content-muted)]">Compact, dismissible feedback for a page-level status or completed operation.</p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Alert variant="success" title="Plan saved" description="Your emergency plan is available offline." dismissible />
                    <Alert variant="info" title="Information" description="A new area update is ready to review." dismissible />
                    <Alert variant="warning" title="Check your location settings" description="Location sharing is currently turned off." dismissible />
                    <Alert variant="danger" title="Could not save changes" description="Check your connection and try again." dismissible />
                  </div>
                </section>

                <section className="mt-10" aria-labelledby="banners-heading">
                  <div className="mb-4">
                    <h3 className="type-h3" id="banners-heading">Banners</h3>
                    <p className="type-caption mt-1 text-[var(--content-muted)]">Use for important information that remains relevant until the person takes action or dismisses it.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Banner
                      actionHref="#components"
                      actionLabel="Review settings"
                      description="Turn on location sharing so your family can see that you are safe during an emergency."
                      dismissible
                      title="Location sharing is off"
                      variant="warning"
                    />
                    <Banner
                      actionHref="#foundations"
                      actionLabel="View your plan"
                      description="Your emergency plan is ready. Keep a copy available on every device you use."
                      dismissible
                      title="Your plan is ready"
                      variant="success"
                    />
                  </div>
                </section>
                <section className="mt-10" aria-labelledby="progress-indicators-heading">
                  <div className="mb-4 max-w-2xl">
                    <h3 className="type-h3" id="progress-indicators-heading">Progress indicators</h3>
                    <p className="type-caption mt-1 text-[var(--content-muted)]">Use determinate progress when the current value and total are known. Pair every state with a label and value; use circular progress for compact summaries and linear progress when horizontal space is available.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <div className="flex items-center justify-center rounded-lg border border-[var(--border-subtle)] p-6">
                      <CircularProgress label="Preparedness progress" max={8} value={5} valueLabel="5/8" variant="success" />
                    </div>
                    <div className="grid gap-4 rounded-lg border border-[var(--border-subtle)] p-5">
                      <LinearProgress label="Water reserve" max={24} value={18} valueLabel="18 / 24 L" variant="success" />
                      <LinearProgress label="Food reserve" max={14} value={6} valueLabel="6 / 14 days" variant="warning" />
                    </div>
                  </div>
                </section>
                <FeedbackShowcase />
              </div>
            )}
            {id === "navigation" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <div className="max-w-2xl">
                  <p className="type-caption text-[var(--content-muted)]">
                    Use the page bar for a title and contextual actions: it centers the title on mobile and aligns it to the content on web. Use the fixed bottom bar below 1024px and the sticky sidebar on desktop for primary destinations; pass the current destination as <code>activeItem</code>.
                  </p>
                </div>
                <NavigationShowcase />
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
            {id === "brand" && (
              <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 sm:p-6">
                <p className="type-caption mb-6 max-w-2xl text-[var(--content-muted)]">
                  Use the color logo as the default brand mark. The white version is reserved for dark, high-contrast backgrounds; use the icon where space is limited. Keep every mark clear of surrounding content.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <section className="rounded-lg border border-[var(--border-subtle)] p-4" aria-labelledby="logo-color-heading">
                    <div className="flex min-h-36 items-center justify-center rounded-md bg-[var(--surface-canvas)] p-5">
                      <Image src="/brand/logo-color.svg" alt="Plan: 0 color logo" width={112} height={112} />
                    </div>
                    <h3 className="type-h3 mt-4" id="logo-color-heading">Color logo</h3>
                    <code className="mt-1 block font-mono text-xs text-[var(--content-muted)]">/brand/logo-color.svg</code>
                  </section>
                  <section className="rounded-lg border border-[var(--border-subtle)] p-4" aria-labelledby="logo-white-heading">
                    <div className="flex min-h-36 items-center justify-center rounded-md bg-[var(--surface-inverse)] p-5">
                      <Image src="/brand/logo-white.svg" alt="Plan: 0 white logo" width={112} height={112} />
                    </div>
                    <h3 className="type-h3 mt-4" id="logo-white-heading">White logo</h3>
                    <code className="mt-1 block font-mono text-xs text-[var(--content-muted)]">/brand/logo-white.svg</code>
                  </section>
                  <section className="rounded-lg border border-[var(--border-subtle)] p-4" aria-labelledby="logo-icon-heading">
                    <div className="flex min-h-36 items-center justify-center rounded-md bg-[var(--surface-canvas)] p-5">
                      <Image src="/brand/logo-icon.svg" alt="Plan: 0 icon" width={112} height={112} />
                    </div>
                    <h3 className="type-h3 mt-4" id="logo-icon-heading">App icon</h3>
                    <code className="mt-1 block font-mono text-xs text-[var(--content-muted)]">app/favicon.ico</code>
                  </section>
                </div>
                <section className="mt-8" aria-labelledby="appearance-variants-heading">
                  <div className="mb-4">
                    <h3 className="type-h3" id="appearance-variants-heading">Appearance variants</h3>
                    <p className="type-caption mt-1 text-[var(--content-muted)]">The product logo switches to the matching asset when an appearance setting changes. Yellow and grayscale preserve the selected high-contrast treatment without introducing a separate, non-accessible mark.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {appearanceVariants.map(({ name, asset, background, filter }) => (
                      <div className="rounded-lg border border-[var(--border-subtle)] p-3" key={name}>
                        <div className="flex h-28 items-center justify-center rounded-md p-4" style={{ backgroundColor: background }}>
                          <Image src={asset} alt={`${name} Plan: 0 logo`} width={72} height={72} style={{ filter }} />
                        </div>
                        <p className="type-caption mt-3 font-semibold">{name}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
