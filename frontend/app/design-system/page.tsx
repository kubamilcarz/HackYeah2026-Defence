import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design system | 72H",
  description: "The 72H interface design system.",
};

const sections = [
  ["01 / Color", "Foundations", "foundations"],
  ["02 / Typography", "Readable by default", "type"],
  ["03 / Actions & inputs", "Components", "components"],
  ["04 / Status", "Feedback", "feedback"],
] as const;

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-canvas)] px-5 py-6 text-[var(--content-primary)] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 grid gap-8 border-b border-[var(--border-strong)] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--content-link)]">
              72H / Foundations
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
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
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          </section>
        ))}
      </div>
    </main>
  );
}
