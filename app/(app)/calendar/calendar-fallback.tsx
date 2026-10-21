// app/(app)/calendar/calendar-fallback.tsx

export default function CalendarFallback() {
  return (
    <div
      role="status"
      aria-label="Loading calendar"
      className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8 animate-pulse sm:px-8"
    >
      {/* PAGE INTRODUCTION */}

      <div className="rounded-[2rem] border border-black/10 bg-white p-6">
        <div className="h-4 w-32 rounded bg-black/10" />
        <div className="mt-4 h-10 w-44 rounded bg-black/10" />
        <div className="mt-4 h-4 w-full max-w-md rounded bg-black/5" />
      </div>

      {/* EVENT CREATION */}

      <div className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-6">
        <div className="h-4 w-32 rounded bg-[#d7bfa8]/50" />
        <div className="mt-4 h-7 w-48 rounded bg-[#d7bfa8]/40" />
        <div className="mt-4 h-4 w-full max-w-sm rounded bg-[#d7bfa8]/30" />
        <div className="mt-5 h-12 w-36 rounded-xl bg-black/15" />
      </div>

      {/* CALENDAR */}

      <div className="rounded-[2rem] border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-7 w-44 rounded bg-black/10" />

          <div className="flex gap-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-10 w-16 rounded-xl bg-black/10"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-5 rounded bg-black/5"
            />
          ))}

          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="h-14 rounded-lg bg-black/5 sm:h-20"
            />
          ))}
        </div>
      </div>

      {/* UPCOMING EVENTS */}

      <div className="rounded-[2rem] border border-black/10 bg-white p-5 sm:p-6">
        <div className="h-7 w-48 rounded bg-black/10" />
        <div className="mt-3 h-4 w-64 max-w-full rounded bg-black/5" />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="space-y-4 rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
            >
              <div className="h-5 w-40 rounded bg-black/10" />
              <div className="h-4 w-48 rounded bg-black/5" />
              <div className="h-4 w-36 rounded bg-black/5" />
              <div className="h-px bg-black/10" />
              <div className="h-9 w-24 rounded-lg bg-black/10" />
            </div>
          ))}
        </div>
      </div>

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="space-y-4 rounded-2xl border border-black/10 bg-white p-5"
          >
            <div className="h-4 w-28 rounded bg-black/10" />
            <div className="h-9 w-12 rounded bg-black/10" />
            <div className="h-4 w-32 rounded bg-black/5" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading calendar...</span>
    </div>
  );
}