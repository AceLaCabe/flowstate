// app/demo/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DemoView = "dashboard" | "projects" | "tasks" | "calendar";

type ProjectStatus = "active" | "on_hold" | "completed";

type DemoProject = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  dueDate: string | null;
  progress: number;
};

type DemoTask = {
  id: string;
  title: string;
  projectId: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
};

type DemoEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};

const navItems: { key: DemoView; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "calendar", label: "Calendar" },
];

function addDays(days: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function formatDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(status: ProjectStatus) {
  if (status === "on_hold") return "On hold";
  return status;
}

function getStatusStyles(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "bg-black text-white";
    case "completed":
      return "bg-green-100 text-green-800";
    case "on_hold":
      return "bg-[#fff7ed] text-[#7b533e]";
    default:
      return "bg-black/5 text-black/70";
  }
}

function getPriorityStyles(priority: DemoTask["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-[#fff7ed] text-[#7b533e]";
  }
}

export default function DemoPage() {
  const [activeView, setActiveView] = useState<DemoView>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const demoData = useMemo(() => {
    const projects: DemoProject[] = [
      {
        id: "spring-campaign",
        title: "Spring Campaign Refresh",
        description:
          "Refresh campaign messaging, visuals, launch assets, and final approval flow.",
        status: "active",
        dueDate: addDays(5),
        progress: 72,
      },
      {
        id: "client-website",
        title: "Client Website Launch",
        description:
          "Finalize launch checklist, QA responsive screens, and prepare handoff notes.",
        status: "active",
        dueDate: addDays(9),
        progress: 58,
      },
      {
        id: "family-travel",
        title: "Family Travel Planning",
        description:
          "Organize reservations, packing notes, day plans, and travel reminders.",
        status: "on_hold",
        dueDate: null,
        progress: 34,
      },
      {
        id: "brand-system",
        title: "Brand System Cleanup",
        description:
          "Archive old assets, consolidate reusable styles, and document final components.",
        status: "completed",
        dueDate: addDays(-4),
        progress: 100,
      },
    ];

    const tasks: DemoTask[] = [
      {
        id: "task-1",
        title: "Finish campaign brief",
        projectId: "spring-campaign",
        completed: false,
        priority: "high",
        dueDate: addDays(1),
      },
      {
        id: "task-2",
        title: "Review homepage wireframes",
        projectId: "client-website",
        completed: false,
        priority: "medium",
        dueDate: addDays(2),
      },
      {
        id: "task-3",
        title: "Collect launch assets",
        projectId: "spring-campaign",
        completed: false,
        priority: "medium",
        dueDate: addDays(4),
      },
      {
        id: "task-4",
        title: "Confirm travel budget",
        projectId: "family-travel",
        completed: false,
        priority: "low",
        dueDate: null,
      },
      {
        id: "task-5",
        title: "Archive old color tokens",
        projectId: "brand-system",
        completed: true,
        priority: "low",
        dueDate: addDays(-3),
      },
    ];

    const events: DemoEvent[] = [
      {
        id: "event-1",
        title: "Campaign planning block",
        startTime: addDays(1, 10),
        endTime: addDays(1, 11, 30),
      },
      {
        id: "event-2",
        title: "Client launch review",
        startTime: addDays(3, 14),
        endTime: addDays(3, 15),
      },
      {
        id: "event-3",
        title: "Weekly reset",
        startTime: addDays(5, 9),
        endTime: addDays(5, 10),
      },
    ];

    return { projects, tasks, events };
  }, []);

  const activeProjects = demoData.projects.filter(
    (project) => project.status === "active"
  );

  const openTasks = demoData.tasks.filter((task) => !task.completed);
  const completedTasks = demoData.tasks.filter((task) => task.completed);
  const highPriorityTasks = openTasks.filter((task) => task.priority === "high");
  const nextTask = highPriorityTasks[0] ?? openTasks[0] ?? null;
  const nextEvent = demoData.events[0] ?? null;

  function getProjectTitle(projectId: string) {
    return (
      demoData.projects.find((project) => project.id === projectId)?.title ??
      "No project"
    );
  }

  function showDemoNotice(action: string) {
    setNotice(`${action} is disabled in demo mode.`);
    window.setTimeout(() => setNotice(null), 2800);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-black/10 bg-white/80 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Link href="/" className="block">
              <p className="text-lg font-semibold tracking-tight text-black">
                Flowstate
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-black/45">
                Demo workspace
              </p>
            </Link>

            <Link
              href="/auth/sign-up"
              className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 lg:hidden"
            >
              Start free
            </Link>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const isActive = activeView === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={[
                    "whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                    isActive
                      ? "bg-black text-white"
                      : "bg-transparent text-black/60 hover:bg-black/5 hover:text-black",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-[#d7bfa8]/60 bg-[#fff7ed] p-4 lg:block">
            <p className="text-sm font-semibold text-[#3b2418]">
              Demo only
            </p>
            <p className="mt-1 text-sm leading-6 text-[#7b533e]">
              Explore the interface with sample data. Creating, editing, and
              deleting are disabled here.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f2]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Interactive preview
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                  {navItems.find((item) => item.key === activeView)?.label}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => showDemoNotice("Saving changes")}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
                >
                  Demo only
                </button>

                <Link
                  href="/auth/sign-up"
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Start free
                </Link>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-10">
            {notice ? (
              <div className="mb-5 rounded-2xl border border-[#d7bfa8]/70 bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#3b2418]">
                {notice}
              </div>
            ) : null}

            {activeView === "dashboard" ? (
              <DashboardDemo
                activeProjects={activeProjects.length}
                openTasks={openTasks.length}
                completedTasks={completedTasks.length}
                nextTask={nextTask}
                nextEvent={nextEvent}
                getProjectTitle={getProjectTitle}
              />
            ) : null}

            {activeView === "projects" ? (
              <ProjectsDemo projects={demoData.projects} />
            ) : null}

            {activeView === "tasks" ? (
              <TasksDemo
                tasks={demoData.tasks}
                getProjectTitle={getProjectTitle}
                onDemoAction={showDemoNotice}
              />
            ) : null}

            {activeView === "calendar" ? (
              <CalendarDemo events={demoData.events} />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardDemo({
  activeProjects,
  openTasks,
  completedTasks,
  nextTask,
  nextEvent,
  getProjectTitle,
}: {
  activeProjects: number;
  openTasks: number;
  completedTasks: number;
  nextTask: DemoTask | null;
  nextEvent: DemoEvent | null;
  getProjectTitle: (projectId: string) => string;
}) {
  return (
    <section className="space-y-8">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-black/55">
            Workspace overview
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Let’s get you into flow.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
            This demo shows how Flowstate keeps projects, tasks, and schedule
            signals visible without overwhelming the page.
          </p>

          <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
              One next action
            </p>

            <p className="mt-2 text-sm leading-6 text-black/65">
              {nextTask
                ? `Start with “${nextTask.title}” from ${getProjectTitle(
                    nextTask.projectId
                  )}.`
                : "No task is waiting."}
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-[#7b533e]">Next event</p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
            {nextEvent?.title ?? "Nothing scheduled"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-[#7b533e]">
            {nextEvent
              ? formatDateTime(nextEvent.startTime)
              : "Events and time blocks will appear here."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DemoMetric label="Active projects" value={activeProjects} />
        <DemoMetric label="Open tasks" value={openTasks} />
        <DemoMetric label="Completed" value={completedTasks} />
        <DemoMetric label="Upcoming events" value={1} />
      </div>
    </section>
  );
}

function ProjectsDemo({ projects }: { projects: DemoProject[] }) {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Project spaces"
        title="Your current work"
        description="A calm overview of active, paused, and completed projects."
        count={`${projects.length} total`}
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold tracking-tight text-black">
                  {project.title}
                </h3>

                <p className="mt-1 text-sm text-black/55">
                  Due: {formatDate(project.dueDate)}
                </p>
              </div>

              <span
                className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                  project.status
                )}`}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-black/65">
              {project.description}
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-black/50">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-black"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TasksDemo({
  tasks,
  getProjectTitle,
  onDemoAction,
}: {
  tasks: DemoTask[];
  getProjectTitle: (projectId: string) => string;
  onDemoAction: (action: string) => void;
}) {
  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Task workspace"
        title="Your next actions"
        description="Review what is open, what is complete, and what needs more attention."
        count={`${tasks.length} total`}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TaskColumn title="Open tasks" count={openTasks.length}>
          {openTasks.map((task) => (
            <DemoTaskCard
              key={task.id}
              task={task}
              getProjectTitle={getProjectTitle}
              onDemoAction={onDemoAction}
            />
          ))}
        </TaskColumn>

        <TaskColumn title="Completed" count={completedTasks.length}>
          {completedTasks.map((task) => (
            <DemoTaskCard
              key={task.id}
              task={task}
              getProjectTitle={getProjectTitle}
              onDemoAction={onDemoAction}
              completedView
            />
          ))}
        </TaskColumn>
      </div>
    </section>
  );
}

function CalendarDemo({ events }: { events: DemoEvent[] }) {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Schedule layer"
        title="Upcoming time blocks"
        description="Meetings, planning sessions, and schedule anchors in one calm view."
        count={`${events.length} events`}
      />

      <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-black">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm text-black/60">
                    Starts: {formatDateTime(event.startTime)}
                  </p>

                  <p className="mt-1 text-sm text-black/55">
                    Ends: {formatDateTime(event.endTime)}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/60">
                  Schedule
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoMetric({ label, value }: { label: string; value: number }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/55">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: string;
}) {
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-black/55">{eyebrow}</p>

          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-black">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
            {description}
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
          {count}
        </span>
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-black">
          {title}
        </h3>

        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
          {count}
        </span>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function DemoTaskCard({
  task,
  getProjectTitle,
  onDemoAction,
  completedView = false,
}: {
  task: DemoTask;
  getProjectTitle: (projectId: string) => string;
  onDemoAction: (action: string) => void;
  completedView?: boolean;
}) {
  return (
    <article
      className={[
        "rounded-2xl border border-black/10 bg-[#fafaf7] p-4",
        completedView ? "opacity-80" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onDemoAction("Task updates")}
          className={[
            "mt-0.5 h-5 w-5 shrink-0 rounded-full border transition",
            task.completed
              ? "border-black bg-black"
              : "border-black/20 bg-white hover:border-black/40",
          ].join(" ")}
          aria-label="Demo task toggle"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4
                className={[
                  "text-base font-semibold text-black",
                  completedView ? "line-through" : "",
                ].join(" ")}
              >
                {task.title}
              </h4>

              <p className="mt-1 text-sm text-black/60">
                {getProjectTitle(task.projectId)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityStyles(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/55">
              Due: {formatDate(task.dueDate)}
            </p>

            <button
              type="button"
              onClick={() => onDemoAction("Editing tasks")}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-black/5"
            >
              Demo edit
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}