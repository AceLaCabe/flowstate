// app/(app)/tasks/tasks-content.tsx


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
  const normalizedProjects = (projects ?? []) as ProjectOption[];

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
        <CreateTaskForm projects={normalizedProjects} />
      </div>

      <TasksView tasks={normalizedTasks} projects={normalizedProjects} />
    </AppShell>
  );
}