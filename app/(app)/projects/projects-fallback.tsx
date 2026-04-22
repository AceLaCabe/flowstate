// app/(app)/projects/projects-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function ProjectsFallback() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between animate-pulse">
        <div className="w-full max-w-2xl">
          <div className="h-4 w-28 rounded bg-black/10" />
          <div className="mt-4 h-10 w-48 rounded bg-black/10" />
          <div className="mt-3 h-5 w-full max-w-[32rem] rounded bg-black/10" />
        </div>

        <div className="h-16 w-full max-w-[220px] rounded-2xl bg-black/10" />
      </div>

      <div className="mb-8 h-14 w-full max-w-[180px] rounded-2xl bg-black/10 animate-pulse" />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <section
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="h-6 w-40 rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-24 rounded bg-black/10 animate-pulse" />
            <div className="mt-4 h-4 w-full rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-5/6 rounded bg-black/10 animate-pulse" />
          </section>
        ))}
      </div>
    </AppShell>
  );
}