// components/marketing/product-preview.tsx

const projects = [
  {
    name: "Spring Campaign Refresh",
    status: "Active",
    due: "Due Apr 28",
    progress: "72%",
  },
  {
    name: "Client Website Launch",
    status: "Active",
    due: "Due May 3",
    progress: "58%",
  },
  {
    name: "Family Travel Planning",
    status: "On hold",
    due: "No due date",
    progress: "34%",
  },
];

export default function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-[2rem] bg-black/5 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.1)]">
        <div className="border-b border-black/5 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
                Flowstate
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Dashboard
              </h2>
            </div>

            <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              Demo preview
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-[#fbfbf8] p-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#667085]">
                Active projects
              </p>

              <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60">
                Live
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight">4</p>

            <p className="mt-1 text-xs text-[#667085]">
              Across client, team, and personal work
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#667085]">
                Tasks due soon
              </p>

              <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60">
                This week
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight">7</p>

            <p className="mt-1 text-xs text-[#667085]">
              Prioritized by deadline and status
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold tracking-tight">
                  Today’s focus
                </p>

                <p className="mt-1 text-sm leading-6 text-[#667085]">
                  Finish the campaign brief before opening new project threads.
                </p>
              </div>

              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                Next step
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold tracking-tight">
                  Recent projects
                </p>

                <p className="mt-1 text-sm text-[#667085]">
                  Your current work at a glance
                </p>
              </div>

              <span className="rounded-full border border-black/10 bg-[#fafaf7] px-3 py-1 text-xs font-medium text-black/70">
                View all
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {projects.map((project) => (
                <div
                  key={project.name}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{project.name}</p>

                      <p className="mt-1 text-sm text-[#667085]">
                        {project.status} • {project.due}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-black/60">
                      {project.progress}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: project.progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:col-span-2">
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  Calendar
                </p>
                <p className="mt-1 font-medium">2 meetings today</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  Assets
                </p>
                <p className="mt-1 font-medium">5 files ready</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  Team
                </p>
                <p className="mt-1 font-medium">3 updates waiting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}