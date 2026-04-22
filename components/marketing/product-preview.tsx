// components/marketing/product-preview.tsx

export default function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-[2rem] bg-black/5 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="border-b border-black/5 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#667085]">
                Flowstate
              </p>
              <h2 className="mt-1 text-lg font-semibold">Dashboard</h2>
            </div>

            <div className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              Calm View
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
            <p className="text-sm text-[#667085]">Active Projects</p>
            <p className="mt-3 text-3xl font-semibold">4</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
            <p className="text-sm text-[#667085]">Tasks Due Soon</p>
            <p className="mt-3 text-3xl font-semibold">7</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">Recent Projects</p>
                <p className="mt-1 text-sm text-[#667085]">
                  Your current work at a glance
                </p>
              </div>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-3">
                <p className="font-medium">Spring Campaign Refresh</p>
                <p className="mt-1 text-sm text-[#667085]">
                  Active • Due Apr 28
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-3">
                <p className="font-medium">Client Website Launch</p>
                <p className="mt-1 text-sm text-[#667085]">
                  Active • Due May 3
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-3">
                <p className="font-medium">Family Travel Planning</p>
                <p className="mt-1 text-sm text-[#667085]">
                  On hold • No due date
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}