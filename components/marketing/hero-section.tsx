// components/marketing/hero-section.tsx

import Link from "next/link";
import ProductPreview from "./product-preview";

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 md:pb-24 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-black/60 shadow-sm">
          <span
            className="h-2 w-2 rounded-full bg-black"
            aria-hidden="true"
          />
          Flowstate
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
          Project planning without the chaos spiral.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6670] sm:text-xl">
          Flowstate helps you organize projects, deadlines, tasks, and team
          momentum in one calm workspace built for real-life workdays.
        </p>

        <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-tight">4</p>
            <p className="mt-1 text-sm text-black/60">active projects</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-tight">7</p>
            <p className="mt-1 text-sm text-black/60">tasks due soon</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-tight">1</p>
            <p className="mt-1 text-sm text-black/60">clear next step</p>
          </div>
        </div>

        <p className="mt-6 max-w-xl text-base leading-7 text-[#667085]">
          Built for freelancers, small teams, agencies, and busy households who
          need a softer way to keep moving.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Start free
          </Link>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            View demo
          </Link>
        </div>
      </div>

      <Link
        id="preview"
        href="/demo"
        aria-label="Open Flowstate demo preview"
        className="group block scroll-mt-24 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
      >
        <div className="transition group-hover:-translate-y-1">
          <ProductPreview />
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-black/55 transition group-hover:text-black">
          Click preview to explore demo
        </p>
      </Link>
    </section>
  );
}