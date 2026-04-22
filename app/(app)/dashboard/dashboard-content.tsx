// app/(app)/dashboard/dashboard-content.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

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

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

type TaskSummary = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  projects: {
    id: string;
    title: string;
    workspace_id?: string;
  }[];
};

export default async function DashboardContent() {
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

  const { data: existingWorkspace, error: workspaceLookupError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (workspaceLookupError) {
    throw new Error(`Workspace lookup failed: ${workspaceLookupError.message}`);
  }

  let workspaceId = existingWorkspace?.id ?? null;
  let workspaceName = existingWorkspace?.name ?? null;

  if (!workspaceId) {
    const defaultWorkspaceName = profile?.first_name
      ? `${profile.first_name}'s Workspace`
      : "My Workspace";

    const { data: newWorkspace, error: createWorkspaceError } = await supabase
      .from("workspaces")
      .insert({
        name: defaultWorkspaceName,
        owner_id: user.id,
      })
      .select("id, name")
      .single();

    if (createWorkspaceError) {
      throw new Error(`Workspace creation failed: ${createWorkspaceError.message}`);
    }

    workspaceId = newWorkspace.id;
    workspaceName = newWorkspace.name;

    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      throw new Error(`Workspace membership creation failed: ${memberError.message}`);
    }
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, status, due_date, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Projects load failed: ${projectsError.message}`);
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(
      "id, title, completed, due_date, priority, created_at, projects!inner(id, title, workspace_id)"
    )
    .eq("projects.workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (tasksError) {
    throw new Error(`Tasks load failed: ${tasksError.message}`);
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (eventsError) {
    throw new Error(`Events load failed: ${eventsError.message}`);
  }

  const { data: members, error: membersError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (membersError) {
    throw new Error(`Workspace members load failed: ${membersError.message}`);
  }

  const normalizedProjects = (projects ?? []) as ProjectSummary[];
  const normalizedTasks = (tasks ?? []) as unknown as TaskSummary[];

  const activeProjects = normalizedProjects.filter(
    (project) => project.status === "active"
  );
  const openTasks = normalizedTasks.filter((task) => !task.completed);
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
    })
    .slice(0, 4);

  const recentProjects = normalizedProjects.slice(0, 3);

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-black/65">Workspace overview</p>
        <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Let’s get you into flow.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
          Organize your projects, tasks, meetings, and assets in one calm workspace.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-sm text-black/55">Current workspace</p>
        <h3 className="mt-2 text-2xl font-semibold text-black">
          {workspaceName ?? "My Workspace"}
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Active Projects</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {activeProjects.length}
          </p>
          <p className="mt-2 text-sm text-black/55">Projects currently in progress</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Open Tasks</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {openTasks.length}
          </p>
          <p className="mt-2 text-sm text-black/55">Tasks still in motion</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Overdue Tasks</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {overdueTasks.length}
          </p>
          <p className="mt-2 text-sm text-black/55">Past due and unfinished</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Team Members</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {members?.length ?? 0}
          </p>
          <p className="mt-2 text-sm text-black/55">People in this workspace</p>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-black">Due Soon</h3>
              <p className="mt-2 text-black/70">
                Your nearest upcoming task deadlines.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {dueSoonTasks.length > 0 ? (
              dueSoonTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-black">{task.title}</p>
                      <p className="mt-1 text-sm text-black/60">
                        {task.projects?.[0]?.title ?? "No project"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {task.priority === "high" && (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
                          High
                        </span>
                      )}
                      {isOverdue(task.due_date, task.completed) && (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-black/55">
                    Due: {formatDueDate(task.due_date)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
                <p className="text-sm font-medium text-black">Nothing due soon</p>
                <p className="mt-1 text-sm text-black/60">
                  Create tasks with due dates to see upcoming priorities here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-xl font-semibold text-black">Quick Snapshot</h3>
          <p className="mt-2 text-sm text-black/65">
            The most important signals from your workspace.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-[#fafaf7] p-4">
              <p className="text-sm text-black/55">High Priority</p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {highPriorityTasks.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#fafaf7] p-4">
              <p className="text-sm text-black/55">Upcoming Events</p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {events?.length ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-[#fafaf7] p-4">
              <p className="text-sm text-black/55">Recent Projects</p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {recentProjects.length}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/projects"
              className="block w-full rounded-xl bg-black px-4 py-3 text-left text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Go to Projects
            </Link>

            <Link
              href="/tasks"
              className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              View Tasks
            </Link>

            <Link
              href="/calendar"
              className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              View Calendar
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-black">Recent Projects</h3>
            <p className="mt-2 text-black/70">
              Your newest project spaces and current momentum.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
            Workspace
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
              >
                <p className="text-base font-semibold text-black">{project.title}</p>
                <p className="mt-2 text-sm capitalize text-black/60">
                  {project.status === "on_hold" ? "On hold" : project.status}
                </p>
                <p className="mt-3 text-sm text-black/55">
                  Due: {formatDueDate(project.due_date)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4 lg:col-span-3">
              <p className="text-sm font-medium text-black">No projects yet</p>
              <p className="mt-1 text-sm text-black/60">
                Create your first project to start filling your dashboard with live data.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}