// app/(app)/dashboard/dashboard-content.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

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

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const nowIso = new Date().toISOString();

  const [
    { count: activeProjectsCount, error: projectsCountError },
    { count: tasksDueSoonCount, error: tasksCountError },
    { count: upcomingEventsCount, error: eventsCountError },
    { count: teamMembersCount, error: membersCountError },
    { data: recentProjects, error: recentProjectsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),

    supabase
      .from("tasks")
      .select("id, projects!inner(workspace_id)", { count: "exact", head: true })
      .eq("completed", false)
      .gte("due_date", today)
      .lte("due_date", nextWeek)
      .eq("projects.workspace_id", workspaceId),

    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("start_time", nowIso),

    supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),

    supabase
      .from("projects")
      .select("id, title, status, due_date, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  if (projectsCountError) {
    throw new Error(`Active projects count failed: ${projectsCountError.message}`);
  }

  if (tasksCountError) {
    throw new Error(`Tasks count failed: ${tasksCountError.message}`);
  }

  if (eventsCountError) {
    throw new Error(`Events count failed: ${eventsCountError.message}`);
  }

  if (membersCountError) {
    throw new Error(`Team member count failed: ${membersCountError.message}`);
  }

  if (recentProjectsError) {
    throw new Error(`Recent projects load failed: ${recentProjectsError.message}`);
  }

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
            {activeProjectsCount ?? 0}
          </p>
          <p className="mt-2 text-sm text-black/55">Projects currently in progress</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Tasks Due Soon</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {tasksDueSoonCount ?? 0}
          </p>
          <p className="mt-2 text-sm text-black/55">Due in the next 7 days</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Upcoming Events</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {upcomingEventsCount ?? 0}
          </p>
          <p className="mt-2 text-sm text-black/55">Scheduled from now onward</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-black/70">Team Members</h3>
          <p className="mt-3 text-3xl font-semibold text-black">
            {teamMembersCount ?? 0}
          </p>
          <p className="mt-2 text-sm text-black/55">People in this workspace</p>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-black">Recent Projects</h3>
              <p className="mt-2 text-black/70">
                Your most recently created projects appear here.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              Live Data
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-black">{project.title}</p>
                      <p className="mt-1 text-sm text-black/60 capitalize">
                        {project.status === "on_hold" ? "On hold" : project.status}
                      </p>
                    </div>
                    <p className="text-xs text-black/50">
                      {project.due_date ? project.due_date : "No due date"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
                <p className="text-sm font-medium text-black">No projects yet</p>
                <p className="mt-1 text-sm text-black/60">
                  Create your first project to start filling your dashboard with real data.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-black">Quick Actions</h3>
          <p className="mt-2 text-sm text-black/65">
            Keep your workspace moving.
          </p>

          <div className="mt-4 space-y-3">
            <a
              href="/projects"
              className="block w-full rounded-xl bg-black px-4 py-3 text-left text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Go to Projects
            </a>

            <a
              href="/tasks"
              className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              View Tasks
            </a>

            <a
              href="/calendar"
              className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              View Calendar
            </a>
          </div>

          <div className="mt-6 rounded-xl bg-[#fafaf7] p-4">
            <p className="text-sm font-medium text-black">Next best step</p>
            <p className="mt-1 text-sm text-black/60">
              Add tasks and events next so your dashboard reflects your real workload.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}