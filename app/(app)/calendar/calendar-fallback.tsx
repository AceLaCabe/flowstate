// app/(app)/calendar/calendar-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function CalendarFallback() {
  return (
    <AppShell>
      <div className="mb-6 sm:mb-8 animate-pulse">
        <div className="h-4 w-24 rounded bg-black/10" />
        <div className="mt-4 h-10 w-44 rounded bg-black/10" />
        <div className="mt-3 h-5 w-full max-w-[28rem] rounded bg-black/10" />
      </div>

      <div className="mb-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="h-6 w-36 rounded bg-black/10" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-12 rounded-xl bg-black/10" />
          <div className="h-12 rounded-xl bg-black/10" />
          <div className="h-12 rounded-xl bg-black/10 sm:col-span-2" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((col) => (
          <section
            key={col}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="h-6 w-36 rounded bg-black/10" />
            <div className="mt-5 space-y-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="h-5 w-40 rounded bg-black/10" />
                  <div className="mt-2 h-4 w-32 rounded bg-black/10" />
                  <div className="mt-2 h-4 w-24 rounded bg-black/10" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}