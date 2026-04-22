// app/(app)/tasks/tasks-content.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateTaskForm from "@/components/forms/create-task-form";
import TaskToggleButton from "@/components/tasks/task-toggle-button";
import EditTaskForm from "@/components/tasks/edit-task-form";

function formatDueDate(date: string | null) {
  if (!date) return "No due date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

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
    .single();

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
  const openTasks = normalizedTasks.filter((task) => !task.completed);
  const completedTasks = normalizedTasks.filter((task) => task.completed);

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-black/65">Task management</p>
        <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Tasks
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
          Track next actions across all your projects in one focused view.
        </p>
      </div>

      <div className="mb-8">
        <CreateTaskForm projects={projects ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Open Tasks</h3>
              <p className="mt-1 text-sm text-black/60">
                What needs attention next.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {openTasks.length}
            </span>
          </div>

          {openTasks.length > 0 ? (
            <div className="space-y-4">
              {openTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="flex items-start gap-3">
                    <TaskToggleButton
                      taskId={task.id}
                      completed={task.completed}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold text-black">
                            {task.title}
                          </h4>
                          <p className="mt-1 text-sm text-black/60">
                            {task.projects?.title ?? "No project"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyles(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-3 text-sm leading-6 text-black/65">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-black/55">
                          Due: {formatDueDate(task.due_date)}
                        </p>

                        <EditTaskForm
                          taskId={task.id}
                          initialTitle={task.title}
                          initialDescription={task.description}
                          initialDueDate={task.due_date}
                          initialPriority={task.priority}
                          initialProjectId={task.project_id}
                          projects={projects ?? []}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">No open tasks</p>
              <p className="mt-1 text-sm text-black/60">
                Create a task to start tracking your work.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Completed</h3>
              <p className="mt-1 text-sm text-black/60">
                Finished work and checked-off items.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {completedTasks.length}
            </span>
          </div>

          {completedTasks.length > 0 ? (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4 opacity-80"
                >
                  <div className="flex items-start gap-3">
                    <TaskToggleButton
                      taskId={task.id}
                      completed={task.completed}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold text-black line-through">
                            {task.title}
                          </h4>
                          <p className="mt-1 text-sm text-black/60">
                            {task.projects?.title ?? "No project"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyles(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-3 text-sm leading-6 text-black/65">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-black/55">
                          Due: {formatDueDate(task.due_date)}
                        </p>

                        <EditTaskForm
                          taskId={task.id}
                          initialTitle={task.title}
                          initialDescription={task.description}
                          initialDueDate={task.due_date}
                          initialPriority={task.priority}
                          initialProjectId={task.project_id}
                          projects={projects ?? []}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">
                Nothing completed yet
              </p>
              <p className="mt-1 text-sm text-black/60">
                Completed tasks will show up here once you start checking things
                off.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}