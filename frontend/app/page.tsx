import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--surface-page)] font-sans text-[var(--content-primary)]">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-[var(--surface-raised)] px-8 py-24 sm:items-start sm:px-16 sm:py-32">
        <Image
          className="h-5 w-[100px] [filter:var(--brand-image-filter)]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight">
            To get started, edit the{" "}
            <code className="rounded bg-[var(--surface-sunken)] px-1.5 py-0.5 font-mono text-[0.9em]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-[var(--content-secondary)]">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-[var(--content-link)] underline underline-offset-4"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-[var(--content-link)] underline underline-offset-4"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--interactive-primary)] px-5 text-[var(--interactive-primary-content)] transition-colors hover:bg-[var(--interactive-primary-hover)] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="h-[14px] w-4 [filter:var(--button-image-filter)]"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border-default)] px-5 text-[var(--content-primary)] transition-colors hover:bg-[var(--interactive-secondary-hover)] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
