// app/demo/page.tsx

import Image from "next/image";
import Link from "next/link";
import DemoAction from "@/components/demo/DemoAction";
import CreatedUpdatedMeta from "../../components/shared/CreatedUpdatedMeta";


export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-black">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-black px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm text-white">
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <Image
              src="/logo.png"
              alt="Flowstate home"
              width={34}
              height={34}
              className="rounded-xl"
              priority
            />
            <span className="font-semibold tracking-tight">Flowstate</span>
          </Link>

          <p className="hidden text-center md:block">
            Demo mode — explore Flowstate with sample data.
          </p>

          <Link href="/auth/sign-up" className="font-medium underline">
            Sign up free →
          </Link>
        </div>
      </div>

      {/* PAGE GRID */}
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        {/* SIDEBAR */}
        <aside className="h-fit rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm lg:sticky lg:top-20">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Demo Menu
          </p>

          <nav className="space-y-2">
            {[
              ["Dashboard", "dashboard"],
              ["Projects", "projects"],
              ["Tasks", "tasks"],
              ["Calendar", "calendar"],
              ["Assets", "assets"],
              ["Team", "team"],
              ["Settings", "settings"],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-black/5"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">
            Flowstate Demo
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Explore a sample workspace.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Click through a preview of Flowstate using sample projects, tasks, calendar,
            assets, and team data. Create an account when you’re ready to save your own workspace.
          </p>

          {/* DASHBOARD */}
          <section
            id="dashboard"
            className="mt-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
  <h2 className="text-2xl font-semibold">Ace’s Demo Workspace</h2>

  <CreatedUpdatedMeta
  createdAt="2026-03-18T10:00:00.000Z"
  updatedAt="2026-04-30T14:15:00.000Z"
/>

  <p className="mt-2 max-w-2xl text-slate-600">
    A preview workspace showing how Flowstate organizes projects,
    deadlines, and team flow.
  </p>
</div>

              <Link
                href="/auth/sign-up"
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Save your workspace →
              </Link>
            </div>

            {/* GUIDED START */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
              <p className="text-sm font-semibold">Start here</p>
              <p className="mt-1 text-sm text-slate-600">
                Try creating a project or adding a task to see how Flowstate organizes your workflow.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <DemoCard label="Active Projects" value="3" />
              <DemoCard label="Open Tasks" value="12" />
              <DemoCard label="Due Soon" value="5" />
              <DemoCard label="Team Members" value="4" />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <DemoPanel title="Recent Projects" id="projects">
                <DemoItem title="Spring Campaign Refresh" meta="Active · Due Apr 28" />
                <DemoItem title="Client Website Launch" meta="Active · Due May 3" />
                <DemoItem title="Family Travel Planning" meta="On hold · No due date" />

                <div className="pt-2">
                  <DemoAction type="project">+ New project</DemoAction>
                </div>
              </DemoPanel>

              <DemoPanel title="Tasks Due Soon" id="tasks">
                <DemoItem title="Finalize homepage copy" meta="High priority · Today" />
                <DemoItem title="Review asset library" meta="Medium priority · Tomorrow" />
                <DemoItem title="Send client update" meta="Low priority · Friday" />

                <div className="pt-2">
                  <DemoAction type="task">+ Add task</DemoAction>
                </div>
              </DemoPanel>
            </div>
          </section>

          {/* CALENDAR */}
          <section
            id="calendar"
            className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="mt-2 text-slate-600">
              A weekly snapshot of upcoming deadlines and project milestones.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <DemoItem title="Monday" meta="Finalize homepage copy" />
              <DemoItem title="Wednesday" meta="Client website review" />
              <DemoItem title="Friday" meta="Team check-in" />
            </div>
          </section>

          {/* ASSETS */}
          <section
            id="assets"
            className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Assets</h2>
            <p className="mt-2 text-slate-600">
              Sample asset library for organizing project files, links, and references.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <DemoItem title="Brand Guidelines.pdf" meta="Spring Campaign Refresh" />
              <DemoItem title="Homepage Wireframes.fig" meta="Client Website Launch" />
              <DemoItem title="Travel Moodboard.png" meta="Family Travel Planning" />
            </div>
          </section>

          {/* TEAM */}
          <section
            id="team"
            className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Team</h2>
            <p className="mt-2 text-slate-600">
              A lightweight team view showing collaborators and workspace roles.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <DemoItem title="Ace LaCabe" meta="Owner · Product + Design" />
              <DemoItem title="Jordan Smith" meta="Collaborator · Content" />
              <DemoItem title="Mia Carter" meta="Collaborator · Design Review" />
              <DemoItem title="Dev Patel" meta="Collaborator · Front-End" />
            </div>
          </section>

          {/* SETTINGS */}
          <section
            id="settings"
            className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="mt-2 text-slate-600">
              Preview workspace preferences. Saving changes requires an account.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <DemoAction type="project">Edit workspace</DemoAction>
              <Link
                href="/auth/sign-up"
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium transition hover:bg-black/5"
              >
                Create account →
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function DemoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#faf9f6] p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function DemoPanel({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-black/10 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DemoItem({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{meta}</p>
    </div>
  );
}