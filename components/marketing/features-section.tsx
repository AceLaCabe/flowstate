// components/marketing/features-section.tsx

const features = [
  {
    title: "Calm by design",
    description:
      "A focused interface built to reduce clutter, context switching, and mental overload.",
  },
  {
    title: "Everything in one place",
    description:
      "Projects, schedules, tasks, meetings, and collaboration live in one clear workspace.",
  },
  {
    title: "Built for real workflows",
    description:
      "Use it solo, with a team, for client work, or to coordinate shared life and logistics.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-8 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#667085]">
          Why Flowstate
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Work with more clarity and less friction.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#5f6670]">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}