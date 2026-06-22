// app/(app)/projects/projects-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function ProjectsFallback() {
  return (
    <AppShell>
      <section className="space-y-8 animate-pulse">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-32 rounded bg-black/10" />
            <div className="mt-4 h-10 w-52 rounded bg-black/10" />
            <div className="mt-3 h-5 w-full max-w-[32rem] rounded bg-black/10" />
            <div className="mt-2 h-5 w-full max-w-[24rem] rounded bg-black/10" />
            <div className="mt-6 h-24 rounded-2xl bg-black/10" />
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-36 rounded bg-black/10" />
            <div className="mt-4 h-8 w-44 rounded bg-black/10" />
            <div className="mt-3 h-5 w-full rounded bg-black/10" />
            <div className="mt-5 h-12 w-full rounded-2xl bg-black/10" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <section
              key={index}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-black/10" />
              <div className="mt-3 h-9 w-12 rounded bg-black/10" />
              <div className="mt-2 h-4 w-32 rounded bg-black/10" />
            </section>
          ))}
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="h-4 w-32 rounded bg-black/10" />
          <div className="mt-3 h-8 w-48 rounded bg-black/10" />
          <div className="mt-3 h-5 w-full max-w-[34rem] rounded bg-black/10" />

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <section
                key={index}
                className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-full">
                    <div className="h-5 w-36 rounded bg-black/10" />
                    <div className="mt-2 h-4 w-24 rounded bg-black/10" />
                  </div>

                  <div className="h-6 w-16 rounded-full bg-black/10" />
                </div>

                <div className="mt-5 h-4 w-full rounded bg-black/10" />
                <div className="mt-2 h-4 w-5/6 rounded bg-black/10" />

                <div className="mt-5 h-px bg-black/10" />

                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-20 rounded-full bg-black/10" />
                  <div className="h-4 w-24 rounded bg-black/10" />
                </div>
              </section>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}