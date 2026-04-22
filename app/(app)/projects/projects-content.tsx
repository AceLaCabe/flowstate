// app/(app)/projects/projects-content.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateProjectForm from "@/components/forms/create-project-form";

function formatDueDate(date: string | null) {
  if (!date) return "No due date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active":
      return "bg-black text-white";
    case "completed":
      return "bg-green-100 text-green-800";
    case "on_hold":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-black/5 text-black/75";
  }
}

export default async function ProjectsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

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
    .select("id, title, description, status, due_date, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Projects load failed: ${projectsError.message}`);
  }

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-black/65">Project planning</p>
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Projects
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
            Organize client work, creative initiatives, launches, and personal goals in one calm workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">
            Workspace
          </p>
          <p className="mt-1 text-sm font-medium text-black">{workspace.name}</p>
        </div>
      </div>

      <div className="mb-8">
        <CreateProjectForm workspaceId={workspace.id} />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold text-black">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-black/55">
                    {formatDueDate(project.due_date)}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(
                    project.status
                  )}`}
                >
                  {project.status === "on_hold" ? "On hold" : project.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-black/70">
                {project.description?.trim() || "No description yet."}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-black/15 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-black">No projects yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-black/65">
            Create your first project to start organizing tasks, deadlines, assets, and team collaboration inside Flowstate.
          </p>
        </section>
      )}
    </AppShell>
  );
}