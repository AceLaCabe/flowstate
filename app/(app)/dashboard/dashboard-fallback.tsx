// app/(app)/dashboard/dashboard-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function DashboardFallback() {
  return (
    <AppShell>
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-32 rounded bg-black/10" />
        <div className="mt-4 h-10 w-80 max-w-full rounded bg-black/10" />
        <div className="mt-3 h-5 w-full max-w-[32rem] rounded bg-black/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <section
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-28 rounded bg-black/10" />
            <div className="mt-4 h-10 w-12 rounded bg-black/10" />
            <div className="mt-3 h-4 w-36 rounded bg-black/10" />
          </section>
        ))}
      </div>
    </AppShell>
  );
}