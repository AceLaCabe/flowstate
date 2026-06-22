// components/marketing/hero.tsx

import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-center">
      <p className="mx-auto inline-flex rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-black/60 shadow-sm">
        Flowstate
      </p>

      <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-black sm:text-6xl">
        Project planning without the chaos spiral.
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#5f6670]">
        A calm workspace for projects, tasks, schedules, assets, and team
        collaboration.
      </p>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/demo"
          className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
        >
          View demo
        </Link>

        <Link
          href="/auth/sign-up"
          className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-black/5"
        >
          Start free
        </Link>
      </div>
    </section>
  );
}