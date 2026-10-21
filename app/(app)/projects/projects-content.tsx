// app/(app)/projects/projects-content.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateProjectForm from "@/components/forms/create-project-form";
import Link from "next/link";

/* ==========================================================
   TYPES
   ========================================================== */

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
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

function isProjectOverdue(project: Project) {
  if (!project.due_date || project.status === "completed") {
    return false;
  }

  const today = new Date();

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dueDate = new Date(`${project.due_date}T00:00:00`);

  return dueDate < todayOnly;
}

function getStatusLabel(status: string) {
  if (status === "on_hold") return "On hold";
  return status.replaceAll("_", " ");
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active":
      return "bg-black text-white";

    case "completed":
      return "bg-green-100 text-green-800";

    case "on_hold":
      return "bg-[#fff7ed] text-[#7b533e]";

    default:
      return "bg-black/5 text-black/75";
  }
}

/* ==========================================================
   PROJECTS PAGE
   ========================================================== */

export default async function ProjectsContent() {
  const supabase = await createClient();

  /* Authentication */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /* Profile */

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Profile load failed: ${profileError.message}`
    );
  }

  /* Workspace */

  const { data: workspace, error: workspaceError } = await supabase
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

  /* Projects */

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, description, status, due_date, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error(
      `Projects load failed: ${projectsError.message}`
    );
  }

  const allProjects = (projects ?? []) as Project[];

  /* Project summaries */

  const activeProjects = allProjects.filter(
    (project) => project.status === "active"
  );

  const completedProjects = allProjects.filter(
    (project) => project.status === "completed"
  );

  const onHoldProjects = allProjects.filter(
    (project) => project.status === "on_hold"
  );

  const overdueProjects = allProjects.filter(isProjectOverdue);

  const totalProjects = allProjects.length;

  /* ========================================================
     PROJECTS INTERFACE
     ======================================================== */

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            01. COMPACT PAGE INTRODUCTION
        ====================================== */}

        <header className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-medium text-black/55">
            {workspace.name}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Projects
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
            Keep your projects, deadlines, and next steps
            organized in one place.
          </p>
        </header>

        {/* ======================================
            02. PROJECT CREATION
        ====================================== */}

        <section
          aria-labelledby="project-create-heading"
          className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-[#7b533e]">
  Project creation
</p>

<h3
  id="project-create-heading"
  className="mt-1 text-xl font-semibold tracking-tight text-[#3b2418] sm:text-2xl"
>
  Start something new.
</h3>

              <p className="mt-2 text-sm leading-6 text-[#7b533e]">
                {totalProjects === 0
                  ? "Your workspace is ready for its first project."
                  : `${totalProjects} ${
                      totalProjects === 1 ? "project" : "projects"
                    } in this workspace.`}
              </p>
            </div>

          </div>

          <div className="mt-4">
            <CreateProjectForm workspaceId={workspace.id} />
          </div>
        </section>

        {/* ======================================
            03. PROJECT LIST
        ====================================== */}

        <section
          aria-labelledby="projects-list-heading"
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-black/55">
                Project spaces
              </p>

              <h3
                id="projects-list-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-black"
              >
                Your current work
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                See what's in progress, paused, completed, or
                waiting for attention.
              </p>
            </div>

            <span className="inline-flex rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-black/65">
              {totalProjects} total
            </span>
          </div>

          {totalProjects > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {allProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState />
            </div>
          )}
        </section>

        {/* ======================================
            04. PROJECT METRICS
        ====================================== */}

        <section aria-labelledby="project-metrics-heading">
          <div className="mb-4">
            <h3
              id="project-metrics-heading"
              className="text-lg font-semibold tracking-tight text-black"
            >
              Project overview
            </h3>

            <p className="mt-1 text-sm text-black/55">
              A quick look at your workspace activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <ProjectMetric
              label="Active"
              value={activeProjects.length}
              description="Currently moving"
            />

            <ProjectMetric
              label="On hold"
              value={onHoldProjects.length}
              description="Paused for now"
              warm={onHoldProjects.length > 0}
            />

            <ProjectMetric
              label="Completed"
              value={completedProjects.length}
              description="Wrapped and closed"
            />

            <ProjectMetric
              label="Overdue"
              value={overdueProjects.length}
              description="Past due and unfinished"
              warm={overdueProjects.length > 0}
            />

          </div>
        </section>

      </div>
    </AppShell>
  );
}

/* ==========================================================
   PROJECT CARD — CLICKABLE
   ========================================================== */

function ProjectCard({ project }: { project: Project }) {
  const overdue = isProjectOverdue(project);

  return (
    <Link
      href={`/projects/${project.id}`}
      aria-label={`Open project: ${project.title}`}
      className="group block rounded-2xl border border-black/10 bg-[#fafaf7] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-lg font-semibold tracking-tight text-black">
            {project.title}
          </h4>

          <p className="mt-2 text-sm text-black/60">
            Due: {formatDueDate(project.due_date)}
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

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/65">
        {project.description?.trim() ||
          "No description added yet."}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            overdue
              ? "bg-red-100 text-red-700"
              : "bg-white text-black/60"
          }`}
        >
          {overdue ? "Past due" : "Project"}
        </span>

        <span className="inline-flex items-center gap-2 text-sm font-semibold text-black">
          Open project
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/* ==========================================================
   PROJECT METRIC
   ========================================================== */

function ProjectMetric({
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
          warm ? "text-[#7b533e]" : "text-black/65"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          warm ? "text-[#3b2418]" : "text-black"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-sm ${
          warm ? "text-[#7b533e]" : "text-black/55"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* ==========================================================
   EMPTY STATE
   ========================================================== */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-8">

      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/55">
        Empty workspace
      </p>

      <h4 className="mt-3 text-2xl font-semibold tracking-tight text-black">
        No projects yet
      </h4>

      <p className="mt-2 max-w-xl text-sm leading-6 text-black/65">
        Create a project to start organizing tasks,
        deadlines, assets, and shared work.
      </p>

    </div>
  );
}