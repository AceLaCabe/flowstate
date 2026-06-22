
// components/marketing/features-section.tsx

const features = [
  {
    eyebrow: "01",
    title: "Calm command center",
    description:
      "Projects, deadlines, tasks, and notes stay visible without turning the workspace into a wall of noise.",
  },
  {
    eyebrow: "02",
    title: "One clear next step",
    description:
      "Flowstate keeps attention on what needs movement now, so users can stop re-scanning everything.",
  },
  {
    eyebrow: "03",
    title: "Flexible real-life planning",
    description:
      "Use it for client work, team projects, household logistics, creative launches, or personal planning.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-10 md:py-18">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#667085]">
          Why Flowstate
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Less scattered planning. More visible momentum.
        </h2>

        <p className="mt-4 text-base leading-7 text-[#5f6670]">
          Flowstate is designed for people managing multiple moving parts
          without wanting a heavy, corporate project management system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
              {feature.eyebrow}
            </div>

            <h3 className="text-xl font-semibold tracking-tight">
              {feature.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#5f6670]">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}