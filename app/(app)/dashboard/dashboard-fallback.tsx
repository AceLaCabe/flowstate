// app/(app)/dashboard/dashboard-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function DashboardFallback() {
  return (
    <AppShell>
      <div
        className="space-y-6 animate-pulse"
        aria-hidden="true"
      >

        {/* Compact introduction */}
        <div className="rounded-[2rem] border border-black/10 bg-white p-7">
          <div className="h-4 w-32 rounded bg-black/10" />
          <div className="mt-4 h-8 w-72 max-w-full rounded bg-black/10" />
          <div className="mt-3 h-4 w-full max-w-md rounded bg-black/10" />
        </div>

        {/* Next action */}
        <div className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-7">
          <div className="h-4 w-24 rounded bg-[#d7bfa8]/50" />
          <div className="mt-5 h-9 w-64 max-w-full rounded bg-[#d7bfa8]/50" />
          <div className="mt-4 h-4 w-full max-w-sm rounded bg-[#d7bfa8]/40" />
          <div className="mt-6 h-20 rounded-2xl bg-white/70" />
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="h-4 w-28 rounded bg-black/10" />
              <div className="mt-4 h-9 w-12 rounded bg-black/10" />
              <div className="mt-3 h-4 w-36 rounded bg-black/10" />
            </div>
          ))}
        </div>

      </div>

      <span className="sr-only" role="status">
        Loading your dashboard
      </span>
    </AppShell>
  );
}