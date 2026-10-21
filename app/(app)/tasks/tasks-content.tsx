// app/(app)/tasks/tasks-content.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateTaskForm from "@/components/forms/create-task-form";
import TasksView from "@/components/tasks/tasks-view";

type TaskWithProject = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  project_id: string;
  projects: {
    id: string;
    title: string;
    workspace_id?: string;
  } | null;
};

type ProjectOption = {
  id: string;
  title: string;
};

function getLocalDateKey() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export default async function TasksContent() {
  const supabase = await createClient();

  /* --------------------------------------------------------
     AUTHENTICATION
  -------------------------------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /* --------------------------------------------------------
     PROFILE AND WORKSPACE
  -------------------------------------------------------- */

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    throw new Error(
      `Profile load failed: ${profileError.message}`
    );
  }

  const { data: workspace, error: workspaceError } =
    await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

  if (workspaceError) {
    throw new Error(
      `Workspace lookup failed: ${workspaceError.message}`
    );
  }

  if (!workspace) {
    redirect("/dashboard");
  }

  /* --------------------------------------------------------
     LOAD PROJECTS AND TASKS
  -------------------------------------------------------- */

  const [
    { data: projects, error: projectsError },
    { data: tasks, error: tasksError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        completed,
        due_date,
        priority,
        created_at,
        project_id,
        projects!inner (
          id,
          title,
          workspace_id
        )
        `
      )
      .eq("projects.workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
  ]);

  if (projectsError) {
    throw new Error(
      `Projects lookup failed: ${projectsError.message}`
    );
  }

  if (tasksError) {
    throw new Error(
      `Tasks load failed: ${tasksError.message}`
    );
  }

  const normalizedProjects =
    (projects ?? []) as ProjectOption[];

  const normalizedTasks =
    (tasks ?? []) as unknown as TaskWithProject[];

  /* --------------------------------------------------------
     TASK METRICS
  -------------------------------------------------------- */

  const todayKey = getLocalDateKey();

  const openTasks = normalizedTasks.filter(
    (task) => !task.completed
  );

  const completedTasks = normalizedTasks.filter(
    (task) => task.completed
  );

  const highPriorityTasks = openTasks.filter(
    (task) => task.priority === "high"
  );

  const overdueTasks = openTasks.filter(
    (task) =>
      task.due_date !== null &&
      task.due_date < todayKey
  );

  const upcomingTasks = openTasks.filter(
    (task) =>
      task.due_date !== null &&
      task.due_date >= todayKey
  );

  const noDateTasks = openTasks.filter(
    (task) => task.due_date === null
  );

  /* ========================================================
     PAGE
  ======================================================== */

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            01. PAGE INTRODUCTION
        ====================================== */}

        <header className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-black/55">
                {workspace.name}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Tasks
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                Keep track of what needs doing, what can
                wait, and what you've finished.
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-black/10 bg-[#fafaf7] px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              View projects
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
        </header>

        {/* ======================================
            02. CREATE TASK
        ====================================== */}

        <section
          aria-labelledby="task-create-heading"
          className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-6"
        >
          <p className="text-sm font-medium text-[#7b533e]">
            Task creation
          </p>

          <h3
            id="task-create-heading"
            className="mt-1 text-xl font-semibold tracking-tight text-[#3b2418] sm:text-2xl"
          >
            Add a next action
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b533e]">
            Capture what needs to happen and connect it
            to a project.
          </p>

          <div className="mt-5">
            <CreateTaskForm
              projects={normalizedProjects}
            />
          </div>
        </section>

        {/* ======================================
            03. TASK WORKSPACE
        ====================================== */}

        <section
          aria-labelledby="task-workspace-heading"
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black/55">
                Task workspace
              </p>

              <h3
                id="task-workspace-heading"
                className="mt-1 text-xl font-semibold tracking-tight text-black sm:text-2xl"
              >
                Your next actions
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
                Filter your work, update tasks, and
                close the loops you've completed.
              </p>
            </div>

            <span className="inline-flex shrink-0 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/65">
              {normalizedTasks.length} total
            </span>
          </div>

          <div className="mt-6">
            <TasksView
              tasks={normalizedTasks}
              projects={normalizedProjects}
            />
          </div>
        </section>

        {/* ======================================
            04. TASK OVERVIEW
        ====================================== */}

        <section
          aria-labelledby="task-overview-heading"
          className="space-y-4"
        >
          <div>
            <h3
              id="task-overview-heading"
              className="text-lg font-semibold tracking-tight text-black"
            >
              Task overview
            </h3>

            <p className="mt-1 text-sm text-black/55">
              A snapshot of your current workload.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TaskMetric
              label="Open"
              value={openTasks.length}
              description="Still to do"
            />

            <TaskMetric
              label="High priority"
              value={highPriorityTasks.length}
              description="Open, high-priority work"
              warm={highPriorityTasks.length > 0}
            />

            <TaskMetric
              label="Overdue"
              value={overdueTasks.length}
              description="Past due and unfinished"
              warm={overdueTasks.length > 0}
            />

            <TaskMetric
              label="Completed"
              value={completedTasks.length}
              description="Finished tasks"
            />
          </div>
        </section>

        {/* ======================================
            05. PLANNING DETAILS
        ====================================== */}

        {normalizedTasks.length > 0 && (
          <section
            aria-labelledby="task-planning-heading"
            className="space-y-4"
          >
            <h3
              id="task-planning-heading"
              className="text-lg font-semibold tracking-tight text-black"
            >
              Planning details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <TaskSignal
                label="Upcoming deadlines"
                value={upcomingTasks.length}
                description="Open tasks due today or later"
              />

              <TaskSignal
                label="No due date"
                value={noDateTasks.length}
                description="Open tasks with flexible timing"
              />
            </div>
          </section>
        )}

      </div>
    </AppShell>
  );
}

/* ==========================================================
   METRIC CARD
========================================================== */

function TaskMetric({
  label,
  value,
  description,
  warm = false,
}: {
  label: string;
  value: number;
  description: string;
  warm?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        warm
          ? "border-[#d7bfa8]/60 bg-[#fff7ed]"
          : "border-black/10 bg-white"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          warm
            ? "text-[#7b533e]"
            : "text-black/65"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          warm
            ? "text-[#3b2418]"
            : "text-black"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-sm ${
          warm
            ? "text-[#7b533e]"
            : "text-black/55"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* ==========================================================
   PLANNING SIGNAL
========================================================== */

function TaskSignal({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/65">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>

      <p className="mt-2 text-sm text-black/55">
        {description}
      </p>
    </div>
  );
}