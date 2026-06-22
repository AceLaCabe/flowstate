// app/(app)/tasks/tasks-content.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
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

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate: string | null, completed: boolean) {
  if (!dueDate || completed) return false;

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const due = new Date(`${dueDate}T00:00:00`);

  return due < todayOnly;
}

export default async function TasksContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Profile load failed: ${profileError.message}`);
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (workspaceError) {
    throw new Error(`Workspace lookup failed: ${workspaceError.message}`);
  }

  if (!workspace) {
    redirect("/dashboard");
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Projects lookup failed: ${projectsError.message}`);
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(
      "id, title, description, completed, due_date, priority, created_at, project_id, projects!inner(id, title, workspace_id)"
    )
    .eq("projects.workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (tasksError) {
    throw new Error(`Tasks load failed: ${tasksError.message}`);
  }

  const normalizedTasks = (tasks ?? []) as unknown as TaskWithProject[];
  const normalizedProjects = (projects ?? []) as ProjectOption[];

  const openTasks = normalizedTasks.filter((task) => !task.completed);
  const completedTasks = normalizedTasks.filter((task) => task.completed);
  const highPriorityTasks = openTasks.filter((task) => task.priority === "high");
  const overdueTasks = openTasks.filter((task) =>
    isOverdue(task.due_date, task.completed)
  );

  const dueSoonTasks = openTasks
    .filter((task) => task.due_date)
    .sort((a, b) => {
      const aTime = new Date(`${a.due_date}T00:00:00`).getTime();
      const bTime = new Date(`${b.due_date}T00:00:00`).getTime();
      return aTime - bTime;
    });

  const noDateTasks = openTasks.filter((task) => !task.due_date);
  const nextTask = overdueTasks[0] ?? dueSoonTasks[0] ?? highPriorityTasks[0] ?? openTasks[0];

  const firstName = profile?.first_name ?? "User";

  return (
    <AppShell
      firstName={firstName}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Task management
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Tasks
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Track next actions across your projects without losing the thread
              of what actually needs movement.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Next task signal
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                {nextTask
                  ? `Start with “${nextTask.title}” from ${
                      nextTask.projects?.title ?? "your workspace"
                    }. ${
                      isOverdue(nextTask.due_date, nextTask.completed)
                        ? "It is overdue, so clearing it first will lower the noise."
                        : nextTask.due_date
                          ? `It is due ${formatDueDate(nextTask.due_date)}.`
                          : "It does not have a due date yet, but it is still open."
                    }`
                  : "No tasks are waiting. Add a task when you are ready to create your next clear move."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-[#fafaf7] px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                View projects
              </Link>

              <Link
                href="/calendar"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Check calendar
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">Quick add</p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              Create a next action
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              Tasks stay connected to projects, so your next steps do not float
              around disconnected from the bigger plan.
            </p>

            <div className="mt-5">
              <CreateTaskForm projects={normalizedProjects} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TaskMetric
            label="Open"
            value={openTasks.length}
            description="Still in motion"
          />

          <TaskMetric
            label="High priority"
            value={highPriorityTasks.length}
            description="Needs stronger attention"
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
            description="Closed and cleared"
          />
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">
                Task workspace
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Your next actions
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                Review what is overdue, what is coming up, and what can wait
                until the work has more room.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {normalizedTasks.length} total
            </span>
          </div>

          <div className="mt-6">
            <TasksView tasks={normalizedTasks} projects={normalizedProjects} />
          </div>
        </section>

        {normalizedTasks.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-3">
            <TaskSignal
              label="Due soon"
              value={dueSoonTasks.length}
              description="Tasks with upcoming dates"
            />

            <TaskSignal
              label="No due date"
              value={noDateTasks.length}
              description="Backlog or flexible work"
            />

            <TaskSignal
              label="Projects available"
              value={normalizedProjects.length}
              description="Places tasks can belong"
            />
          </section>
        ) : null}
      </section>
    </AppShell>
  );
}

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
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        warm
          ? "border-[#d7bfa8]/60 bg-[#fff7ed]"
          : "border-black/10 bg-white"
      }`}
    >
      <h3
        className={`text-sm font-medium ${
          warm ? "text-[#7b533e]" : "text-black/65"
        }`}
      >
        {label}
      </h3>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          warm ? "text-[#3b2418]" : "text-black"
        }`}
      >
        {value}
      </p>

      <p className={`mt-2 text-sm ${warm ? "text-[#7b533e]" : "text-black/55"}`}>
        {description}
      </p>
    </section>
  );
}

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
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/55">{label}</p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>

      <p className="mt-2 text-sm text-black/55">{description}</p>
    </section>
  );
}