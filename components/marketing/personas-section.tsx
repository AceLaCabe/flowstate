// components/marketing/personas-section.tsx

const personas = [
  {
    title: "Freelancers",
    label: "Client work",
    description:
      "Track client projects, deadlines, deliverables, and weekly priorities without rebuilding your system every Monday.",
  },
  {
    title: "Small teams",
    label: "Shared momentum",
    description:
      "Keep projects, meetings, handoffs, and ownership visible so fewer updates get buried in scattered threads.",
  },
  {
    title: "Agencies",
    label: "Creative operations",
    description:
      "Manage multiple initiatives, launch timelines, assets, and approvals with a calmer view of what is moving.",
  },
  {
    title: "Households",
    label: "Life logistics",
    description:
      "Coordinate schedules, events, responsibilities, and shared plans in one home base that does not feel corporate.",
  },
];

export default function PersonasSection() {
  return (
    <section id="who-its-for" className="mx-auto max-w-6xl px-6 py-10 md:py-18">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#667085]">
          Use cases
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for the messy middle of real work and real life.
        </h2>

        <p className="mt-4 text-base leading-7 text-[#5f6670]">
          Flowstate is flexible enough to support professional projects, creative
          launches, shared planning, and everyday coordination.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {personas.map((persona) => (
          <article
            key={persona.title}
            className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-5 inline-flex rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/60">
              {persona.label}
            </div>

            <h3 className="text-xl font-semibold tracking-tight">
              {persona.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#5f6670]">
              {persona.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}