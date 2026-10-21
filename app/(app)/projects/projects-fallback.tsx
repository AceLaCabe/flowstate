// app/(app)/tasks/tasks-fallback.tsx

export default function TasksFallback() {
  return (
    <div
      role="status"
      aria-label="Loading tasks"
      className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8 animate-pulse sm:px-8"
    >
      {/* PAGE INTRODUCTION */}

      <div className="rounded-[2rem] border border-black/10 bg-white p-6">
        <div className="h-4 w-32 rounded bg-black/10" />

        <div className="mt-4 h-10 w-40 rounded-lg bg-black/10" />

        <div className="mt-4 h-4 w-full max-w-md rounded bg-black/5" />
      </div>

      {/* CREATE TASK */}

      <div className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-6">
        <div className="h-4 w-28 rounded bg-[#d7bfa8]/50" />

        <div className="mt-4 h-7 w-48 rounded bg-[#d7bfa8]/40" />

        <div className="mt-4 h-4 w-full max-w-sm rounded bg-[#d7bfa8]/30" />

        <div className="mt-5 h-12 w-36 rounded-xl bg-black/15" />
      </div>

      {/* TASK WORKSPACE */}

      <div className="rounded-[2rem] border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-md">
            <div className="h-4 w-32 rounded bg-black/10" />

            <div className="mt-3 h-7 w-48 rounded bg-black/10" />

            <div className="mt-3 h-4 w-full rounded bg-black/5" />
          </div>

          <div className="h-7 w-16 shrink-0 rounded-full bg-black/10" />
        </div>

        {/* FILTER PILLS */}

        <div className="mt-7 flex flex-wrap gap-2">
          {[80, 85, 110, 125, 95].map((width) => (
            <div
              key={width}
              style={{ width }}
              className="h-10 rounded-full bg-black/10"
            />
          ))}
        </div>

        {/* TASK LIST */}

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {[0, 1].map((column) => (
            <div
              key={column}
              className="space-y-4 rounded-2xl border border-black/10 bg-white p-4"
            >
              <div className="h-6 w-32 rounded bg-black/10" />

              <div className="h-4 w-44 rounded bg-black/5" />

              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="space-y-4 rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="h-5 w-2/3 rounded bg-black/10" />

                  <div className="h-4 w-1/2 rounded bg-black/5" />

                  <div className="h-12 rounded bg-black/5" />

                  <div className="h-px bg-black/10" />

                  <div className="h-5 w-24 rounded bg-black/5" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* TASK OVERVIEW */}

      <div className="space-y-4">
        <div className="h-6 w-40 rounded bg-black/10" />

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
      </div>

      <span className="sr-only">Loading tasks...</span>
    </div>
  );
}