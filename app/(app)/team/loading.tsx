// app/(app)/team/loading.tsx


import AppShell from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <section className="space-y-8 animate-pulse">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-36 rounded bg-black/10" />
            <div className="mt-4 h-10 w-72 rounded bg-black/10" />
            <div className="mt-3 h-5 w-full max-w-[34rem] rounded bg-black/10" />
            <div className="mt-2 h-5 w-full max-w-[24rem] rounded bg-black/10" />
            <div className="mt-6 h-24 rounded-2xl bg-black/10" />
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="h-4 w-28 rounded bg-black/10" />
            <div className="mt-4 h-8 w-48 rounded bg-black/10" />
            <div className="mt-3 h-5 w-full rounded bg-black/10" />
            <div className="mt-5 h-28 rounded-2xl bg-black/10" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border border-black/10 bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-96 rounded-[2rem] border border-black/10 bg-white shadow-sm" />
      </section>
    </AppShell>
  );
}