// app/(app)/dashboard/dashboard-content.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

/* ==========================================================
   TYPES
   ========================================================== */

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

type TaskProject = {
  id: string;
  title: string;
  workspace_id?: string;
};

type TaskSummary = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  projects: TaskProject | TaskProject[] | null;
};

/* ==========================================================
   HELPERS
   ========================================================== */

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function isOverdue(
  dueDate: string | null,
  completed: boolean
) {
  if (!dueDate || completed) return false;

  const today = new Date();

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return new Date(`${dueDate}T00:00:00`) < todayOnly;
}

function getProjectTitle(
  projects: TaskSummary["projects"]
) {
  if (Array.isArray(projects)) {
    return projects[0]?.title ?? "No project";
  }

  return projects?.title ?? "No project";
}

function getStatusLabel(status: string) {
  if (status === "on_hold") return "On hold";

  return status.replaceAll("_", " ");
}

/* ==========================================================
   TASK PRIORITIZATION
   ========================================================== */

function prioritizeTasks(tasks: TaskSummary[]) {
  const priorityRank: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const aOverdue = isOverdue(
        a.due_date,
        a.completed
      );

      const bOverdue = isOverdue(
        b.due_date,
        b.completed
      );

      // Overdue work comes first.
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // Then compare priority.
      const aPriority =
        priorityRank[a.priority] ?? 3;

      const bPriority =
        priorityRank[b.priority] ?? 3;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then compare deadlines.
      const aDue = a.due_date
        ? new Date(
            `${a.due_date}T00:00:00`
          ).getTime()
        : Infinity;

      const bDue = b.due_date
        ? new Date(
            `${b.due_date}T00:00:00`
          ).getTime()
        : Infinity;

      if (aDue !== bDue) {
        return aDue - bDue;
      }

      // Consistent final ordering.
      return (
        a.created_at.localeCompare(b.created_at) ||
        a.id.localeCompare(b.id)
      );
    });
}

function getFocusReason(
  task: TaskSummary | null
) {
  if (!task) {
    return "Your workspace is clear. Add a task when you're ready.";
  }

  if (isOverdue(task.due_date, task.completed)) {
    return "This task is overdue, so addressing it can help clear outstanding work.";
  }

  if (task.priority === "high") {
    return "This task is marked high priority.";
  }

  if (task.due_date) {
    return "This is one of your upcoming deadlines.";
  }

  return "This task is ready for your attention.";
}

/* ==========================================================
   DASHBOARD DATA
   ========================================================== */

export default async function DashboardContent() {
  const supabase = await createClient();

  /* Authentication */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /* Profile */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Profile load failed: ${profileError.message}`
    );
  }

  /* Workspace lookup */

  const {
    data: existingWorkspace,
    error: workspaceLookupError,
  } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (workspaceLookupError) {
    throw new Error(
      `Workspace lookup failed: ${workspaceLookupError.message}`
    );
  }

  let workspaceId = existingWorkspace?.id ?? null;
  let workspaceName = existingWorkspace?.name ?? null;

  /* Create a default workspace if needed */

  if (!workspaceId) {
    const defaultWorkspaceName = profile?.first_name
      ? `${profile.first_name}'s Workspace`
      : "My Workspace";

    const {
      data: newWorkspace,
      error: createWorkspaceError,
    } = await supabase
      .from("workspaces")
      .insert({
        name: defaultWorkspaceName,
        owner_id: user.id,
      })
      .select("id, name")
      .single();

    if (createWorkspaceError) {
      throw new Error(
        `Workspace creation failed: ${createWorkspaceError.message}`
      );
    }

    workspaceId = newWorkspace.id;
    workspaceName = newWorkspace.name;

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      throw new Error(
        `Workspace membership creation failed: ${memberError.message}`
      );
    }
  }

  /* Fetch workspace projects, tasks, and members */

  const [
    projectsResult,
    tasksResult,
    membersResult,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, title, status, due_date, created_at"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),

    supabase
      .from("tasks")
      .select(
        "id, title, completed, due_date, priority, created_at, projects!inner(id, title, workspace_id)"
      )
      .eq("projects.workspace_id", workspaceId)
      .order("created_at", { ascending: false }),

    supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId),
  ]);

  if (projectsResult.error) {
    throw new Error(
      `Projects load failed: ${projectsResult.error.message}`
    );
  }

  if (tasksResult.error) {
    throw new Error(
      `Tasks load failed: ${tasksResult.error.message}`
    );
  }

  if (membersResult.error) {
    throw new Error(
      `Workspace members load failed: ${membersResult.error.message}`
    );
  }

  /* Normalize data */

  const projects =
    (projectsResult.data ?? []) as ProjectSummary[];

  const tasks =
    (tasksResult.data ?? []) as unknown as TaskSummary[];

  /* Dashboard metrics */

  const activeProjects = projects.filter(
    (project) => project.status === "active"
  );

  const openTasks = tasks.filter(
    (task) => !task.completed
  );

  const overdueTasks = openTasks.filter(
    (task) =>
      isOverdue(task.due_date, task.completed)
  );

  const teamCount = membersResult.data?.length ?? 0;

  /* Recommended next action */

  const prioritizedTasks = prioritizeTasks(tasks);

  const nextFocusTask = prioritizedTasks[0] ?? null;

  const nextFocusOverdue = nextFocusTask
    ? isOverdue(
        nextFocusTask.due_date,
        nextFocusTask.completed
      )
    : false;

  const nextFocusReason = getFocusReason(
    nextFocusTask
  );

  /* Upcoming deadlines */

  const upcomingTasks = openTasks
    .filter(
      (task) =>
        task.due_date !== null &&
        !isOverdue(task.due_date, task.completed)
    )
    .sort((a, b) =>
      (a.due_date ?? "").localeCompare(
        b.due_date ?? ""
      )
    )
    .slice(0, 4);

  /* Recent projects */

  const recentProjects = projects.slice(0, 3);

  const firstName = profile?.first_name ?? "User";
  const lastName = profile?.last_name ?? "";

  /* ========================================================
     DASHBOARD INTERFACE
     ======================================================== */

  return (
    <AppShell
      firstName={firstName}
      lastName={lastName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            01. COMPACT WELCOME
        ====================================== */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">
              <p className="text-sm font-medium text-black/55">
                {workspaceName ?? "My Workspace"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Let's get you into flow, {firstName}.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-black/65 sm:text-base">
                Find your next step, then keep the
                bigger picture in view.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Projects
              </Link>

              <Link
                href="/tasks"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-[#fafaf7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Tasks
              </Link>
            </div>

          </div>
        </section>

        {/* ======================================
            02. ONE NEXT ACTION
        ====================================== */}

        <section
          aria-labelledby="dashboard-next-action"
          className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7b533e]">
              Your focus
            </p>

            {nextFocusTask && (
              <TaskBadge
                priority={nextFocusTask.priority}
                overdue={nextFocusOverdue}
              />
            )}
          </div>

          <h3
            id="dashboard-next-action"
            className="mt-4 text-2xl font-semibold tracking-tight text-[#3b2418] sm:text-3xl"
          >
            {nextFocusTask
              ? nextFocusTask.title
              : "Nothing needs your attention right now."}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#7b533e]">
            {nextFocusTask
              ? `${getProjectTitle(
                  nextFocusTask.projects
                )} · ${nextFocusTask.due_date
                  ? `Due ${formatDueDate(
                      nextFocusTask.due_date
                    )}`
                  : "No due date"}`
              : "Your next move can start whenever you're ready."}
          </p>

          <div className="mt-5 rounded-2xl border border-[#ead8c8] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b533e]">
              {nextFocusTask
                ? "Why this task?"
                : "A calm starting point"}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#3b2418]">
              {nextFocusReason}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={
                nextFocusTask
                  ? "/tasks"
                  : "/projects"
              }
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {nextFocusTask
                ? "Review task"
                : "Open projects"}
            </Link>

            <Link
              href="/calendar"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ead8c8] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Check calendar
            </Link>
          </div>

        </section>

        {/* ======================================
            03. WORKSPACE METRICS
        ====================================== */}

        <section aria-labelledby="dashboard-metrics-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                id="dashboard-metrics-title"
                className="text-lg font-semibold tracking-tight text-black"
              >
                At a glance
              </h3>

              <p className="mt-1 text-sm text-black/55">
                Your current workspace activity.
              </p>
            </div>

            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/65">
              {workspaceName ?? "My Workspace"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active projects"
              value={activeProjects.length}
              description="Currently in progress"
            />

            <MetricCard
              label="Open tasks"
              value={openTasks.length}
              description="Waiting to be completed"
            />

            <MetricCard
              label="Overdue tasks"
              value={overdueTasks.length}
              description="Past due and unfinished"
              warm={overdueTasks.length > 0}
            />

            <MetricCard
              label="Team members"
              value={teamCount}
              description="People in this workspace"
            />
          </div>
        </section>

        {/* ======================================
            04. UPCOMING DEADLINES
        ====================================== */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-black/55">
                Coming up
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Next deadlines
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Your nearest upcoming tasks.
              </p>
            </div>

            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {upcomingTasks.length} shown
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))
            ) : (
              <EmptyState
                title="No upcoming deadlines"
                description="Tasks with future due dates will appear here."
                actionHref="/tasks"
                actionLabel="Go to tasks"
              />
            )}
          </div>
        </section>

        {/* ======================================
            05. RECENT PROJECTS
        ====================================== */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>
              <p className="text-sm font-medium text-black/55">
                Recent projects
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Current project spaces
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Your newest projects and their current status.
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-black/70 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first project to start organizing your work."
                actionHref="/projects"
                actionLabel="Go to projects"
              />
            )}
          </div>
        </section>

      </div>
    </AppShell>
  );
}

/* ==========================================================
   REUSABLE DASHBOARD COMPONENTS
   ========================================================== */

function MetricCard({
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

function TaskBadge({
  priority,
  overdue,
}: {
  priority: string;
  overdue: boolean;
}) {
  if (overdue) {
    return (
      <span className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Overdue
      </span>
    );
  }

  if (priority === "high") {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#7b533e]">
        High priority
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
      Open
    </span>
  );
}

function TaskCard({
  task,
}: {
  task: TaskSummary;
}) {
  const overdue = isOverdue(
    task.due_date,
    task.completed
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">
            {task.title}
          </p>

          <p className="mt-1 text-sm text-black/60">
            {getProjectTitle(task.projects)}
          </p>
        </div>

        <TaskBadge
          priority={task.priority}
          overdue={overdue}
        />
      </div>

      <p className="mt-3 text-sm text-black/55">
        Due: {formatDueDate(task.due_date)}
      </p>
    </div>
  );
}

function ProjectCard({
  project,
}: {
  project: ProjectSummary;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <p className="text-base font-semibold text-black">
            {project.title}
          </p>

          <p className="mt-2 text-sm capitalize text-black/60">
            {getStatusLabel(project.status)}
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black/60">
          Project
        </span>
      </div>

      <p className="mt-4 text-sm text-black/55">
        Due: {formatDueDate(project.due_date)}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5 lg:col-span-full">
      <p className="text-sm font-semibold text-black">
        {title}
      </p>

      <p className="mt-1 max-w-xl text-sm leading-6 text-black/60">
        {description}
      </p>

      <Link
        href={actionHref}
        className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        {actionLabel}
      </Link>
    </div>
  );
}