// components/marketing/hero-section.tsx

import Link from "next/link";
import ProductPreview from "./product-preview";

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <p className="mb-5 text-sm uppercase tracking-[0.24em] text-[#667085]">
          Flowstate
        </p>

        <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
          A calm workspace that keeps projects, tasks, and teams moving—without the chaos.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6670] sm:text-xl">
          Plan tasks, manage deadlines, organize assets, and collaborate in one clear, structured workspace.
        </p>

        <p className="mt-5 text-base text-[#667085]">
          Built for freelancers • teams • agencies • households
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Start Free
          </Link>

          <a
            href="#preview"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            See Demo
          </a>
        </div>
      </div>

      <div id="preview">
        <ProductPreview />
      </div>
    </section>
  );
}