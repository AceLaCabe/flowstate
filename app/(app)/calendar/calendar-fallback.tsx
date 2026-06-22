// app/(app)/calendar/calendar-fallback.tsx

import AppShell from "@/components/layout/app-shell";

export default function CalendarFallback() {
  return (
    <AppShell>
      <section className="space-y-8 animate-pulse">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-40 rounded bg-black/10" />
            <div className="mt-4 h-10 w-44 rounded bg-black/10" />
            <div className="mt-3 h-5 w-full max-w-[34rem] rounded bg-black/10" />
            <div className="mt-2 h-5 w-full max-w-[24rem] rounded bg-black/10" />
            <div className="mt-6 h-24 rounded-2xl bg-black/10" />
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-24 rounded bg-black/10" />
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="h-4 w-32 rounded bg-black/10" />
              <div className="mt-3 h-8 w-52 rounded bg-black/10" />
            </div>

            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-full bg-black/10" />
              <div className="h-9 w-20 rounded-full bg-black/10" />
              <div className="h-9 w-20 rounded-full bg-black/10" />
            </div>
          </div>

          <div className="mt-6 h-80 rounded-2xl bg-black/10" />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          {[0, 1].map((column) => (
            <section
              key={column}
              className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="h-6 w-36 rounded bg-black/10" />

              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }).map((_, item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
                  >
                    <div className="h-5 w-40 rounded bg-black/10" />
                    <div className="mt-2 h-4 w-36 rounded bg-black/10" />
                    <div className="mt-2 h-4 w-28 rounded bg-black/10" />
                    <div className="mt-4 h-px bg-black/10" />
                    <div className="mt-4 h-8 w-36 rounded bg-black/10" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </AppShell>
  );
}