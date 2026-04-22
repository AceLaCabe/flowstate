// components/marketing/cta-section.tsx

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[#667085]">
            Ready to begin
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start building your calmer workflow.
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5f6670] sm:text-lg">
            Flowstate gives you one clear place to manage projects, timelines,
            tasks, and collaboration without the noise.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Start Free
          </Link>

          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Log In
          </Link>
        </div>
      </div>
    </section>
  );
}