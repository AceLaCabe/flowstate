// components/marketing/cta-section.tsx

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#D1B59A]/50 bg-[#AF836B] p-8 text-white shadow-[0_24px_70px_rgba(143,95,69,0.22)] sm:p-10">
        <div
          className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#f7dfc8]/25 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
              Ready to begin
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Give your workflow one calm place to land.
            </h2>

            <p className="mt-4 text-base leading-8 text-white/78 sm:text-lg">
              Flowstate helps users move from scattered notes, loose deadlines,
              and floating tasks into one clearer planning rhythm.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-2xl bg-[#fff7ed] px-6 py-3.5 text-sm font-semibold text-[#3b2418] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8f5f45]"
            >
              Start free
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8f5f45]"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}