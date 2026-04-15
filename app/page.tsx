// app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#111]">
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">
          FLOW STATE
        </p>

        <h1 className="text-6xl font-semibold leading-tight max-w-4xl">
          Organize projects, schedules, assets, and collaboration in one calm workspace.
        </h1>

        <p className="mt-6 text-xl text-gray-600 max-w-2xl">
          Built for creatives, teams, freelancers, and service businesses who want clarity without chaos.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/auth/sign-up"
            className="px-6 py-3 rounded-xl bg-black text-white"
          >
            Start Free
          </a>

          <a
            href="/auth/login"
            className="px-6 py-3 rounded-xl border border-gray-300"
          >
            Log In
          </a>
        </div>
      </section>
    </main>
  );
}