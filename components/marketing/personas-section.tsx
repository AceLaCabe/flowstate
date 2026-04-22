// components/marketing/features-section.tsx

const personas = [
  {
    title: "Freelancers",
    description:
      "Track client work, deadlines, deliverables, and your weekly workflow without chaos.",
  },
  {
    title: "Teams",
    description:
      "Keep projects, meetings, and handoffs aligned in one calm shared system.",
  },
  {
    title: "Agencies",
    description:
      "Manage multiple initiatives, timelines, and creative operations with more clarity.",
  },
  {
    title: "Households",
    description:
      "Coordinate schedules, events, responsibilities, and plans in one shared home base.",
  },
];

export default function PersonasSection() {
  return (
    <section id="who-its-for" className="mx-auto max-w-6xl px-6 py-8 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#667085]">
          Who it’s for
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Flexible enough for real life and real work.
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {personas.map((persona) => (
          <article
            key={persona.title}
            className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold">{persona.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#5f6670]">
              {persona.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}