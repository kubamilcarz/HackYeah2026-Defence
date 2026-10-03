import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--surface-canvas)] font-sans text-[var(--content-primary)]">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-[var(--surface-raised)] px-8 py-24 sm:items-start sm:px-16 sm:py-32">
        <div className="brand-logo" role="img" aria-label="72H">
          <Image
            className="brand-logo__asset brand-logo__asset--color"
            src="/brand/logo-color.svg"
            alt=""
            width={80}
            height={80}
            priority
          />
          <Image
            className="brand-logo__asset brand-logo__asset--white"
            src="/brand/logo-white.svg"
            alt=""
            width={80}
            height={80}
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="type-h1 max-w-xs">
            Be ready when every hour matters.
          </h1>
          <p className="type-body max-w-md text-[var(--content-secondary)]">
            72H brings essential information, plans, and emergency support together in one accessible place.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-5 text-[var(--action-primary-content)] transition-colors hover:bg-[var(--action-primary-hover)] hover:text-[var(--action-primary-hover-content)] active:bg-[var(--action-primary-pressed)] active:text-[var(--action-primary-pressed-content)] md:w-[158px]"
            href="/design-system"
          >
            View system
          </a>
          <a
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[var(--content-primary)] transition-colors hover:bg-[var(--action-secondary-hover)] md:w-[158px]"
            href="/design-system#brand"
          >
            Brand assets
          </a>
        </div>
      </main>
    </div>
  );
}
