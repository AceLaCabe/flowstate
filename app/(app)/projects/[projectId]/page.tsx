// app/(app)/projects/[projectId]/page.tsx

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import CreateTaskForm from "@/components/forms/create-task-form";
import EditProjectForm from "@/components/forms/edit-project-form";
import TasksView from "@/components/tasks/tasks-view";
import { createClient } from "@/lib/supabase/server";
import DeleteProjectButton from "@/components/projects/delete-project-button";

/* ==========================================================
   TYPES
   ========================================================== */

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
};

type Task = {
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
    workspace_id: string;
  } | null;
};

/* ==========================================================
   HELPERS
   ========================================================== */

function formatDate(date: string | null) {
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
      return "bg-black/5 text-black/70";
  }
}

function isOverdue(date: string | null) {
  if (!date) return false;

  const today = new Date();

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return date < todayKey;
}

/* ==========================================================
   PROJECT DETAIL PAGE
   ========================================================== */

export default async function ProjectDetailPage({
  params,
}: PageProps) {
  const { projectId } = await params;

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
     LOAD PROJECT WITH WORKSPACE SCOPE
     -------------------------------------------------------- */

  const { data: projectData, error: projectError } =
    await supabase
      .from("projects")
      .select(
        "id, title, description, status, due_date, created_at"
      )
      .eq("id", projectId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();

  if (projectError) {
    throw new Error(
      `Project load failed: ${projectError.message}`
    );
  }

  if (!projectData) {
    notFound();
  }

  const project = projectData as Project;

  /* --------------------------------------------------------
     LOAD THIS PROJECT'S TASKS
     -------------------------------------------------------- */

  const { data: taskData, error: tasksError } =
    await supabase
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
      .eq("project_id", project.id)
      .eq("projects.workspace_id", workspace.id)
      .order("created_at", { ascending: false });

  if (tasksError) {
    throw new Error(
      `Project tasks failed to load: ${tasksError.message}`
    );
  }

  // Supabase relation shapes can be inferred differently
  // depending on generated types. Normalize to the shape
  // used by the existing TasksView component.

  const tasks: Task[] = (taskData ?? []).map((task) => {
    const relatedProject = Array.isArray(task.projects)
      ? task.projects[0] ?? null
      : task.projects ?? null;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      due_date: task.due_date,
      priority: task.priority,
      created_at: task.created_at,
      project_id: task.project_id,
      projects: relatedProject,
    };
  });

  /* --------------------------------------------------------
     TASK METRICS
     -------------------------------------------------------- */

  const openTasks = tasks.filter(
    (task) => !task.completed
  );

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const overdueTasks = openTasks.filter(
    (task) => isOverdue(task.due_date)
  );

  const projectOptions = [
    {
      id: project.id,
      title: project.title,
    },
  ];

  /* ========================================================
     INTERFACE
     ======================================================== */

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* BACK NAVIGATION */}

        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-black/65 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">←</span>
          All projects
        </Link>

        {/* ======================================
            01. PROJECT OVERVIEW
        ====================================== */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-black/55">
                {workspace.name}
              </p>

              <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                {project.title}
              </h2>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyles(
                project.status
              )}`}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>

          <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-black/65 sm:text-base">
            {project.description?.trim() ||
              "No description has been added to this project yet."}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-black/10 pt-5">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">
                Due date
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {formatDate(project.due_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">
                Created
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {formatDate(project.created_at.slice(0, 10))}
              </p>
            </div>



          </div>
          <div className="mt-6 border-t border-black/10 pt-5">
                      {/* PROJECT EDITING */}

  <EditProjectForm
    projectId={project.id}
    workspaceId={workspace.id}
    initialTitle={project.title}
    initialDescription={project.description}
    initialDueDate={project.due_date}
    initialStatus={project.status}
  />
</div>
        </section>

        {/* ======================================
            02. PROJECT TASK SUMMARY
        ====================================== */}

        <section aria-labelledby="project-progress-title">
          <div className="mb-4">
            <h3
              id="project-progress-title"
              className="text-lg font-semibold tracking-tight text-black"
            >
              Project progress
            </h3>

            <p className="mt-1 text-sm text-black/55">
              A quick view of the work connected to this project.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <SummaryCard
              label="Open tasks"
              value={openTasks.length}
              description="Still in progress"
            />

            <SummaryCard
              label="Completed"
              value={completedTasks.length}
              description="Finished tasks"
            />

            <SummaryCard
              label="Overdue"
              value={overdueTasks.length}
              description="Past due and unfinished"
              warm={overdueTasks.length > 0}
            />

          </div>
        </section>

        {/* ======================================
            03. ADD PROJECT TASK
        ====================================== */}

        <section
          aria-labelledby="project-add-task-title"
          className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-6"
        >
          <p className="text-sm font-medium text-[#7b533e]">
            Next actions
          </p>

          <h3
            id="project-add-task-title"
            className="mt-1 text-xl font-semibold tracking-tight text-[#3b2418] sm:text-2xl"
          >
            Add a task to this project
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#7b533e]">
            Break the project into manageable steps.
          </p>

          <div className="mt-5">
            <CreateTaskForm
              projects={projectOptions}
              defaultProjectId={project.id}
            />

            {/* PROJECT DELETION */}

<div className="pt-6">
  <DeleteProjectButton
    projectId={project.id}
    workspaceId={workspace.id}
    projectTitle={project.title}
    taskCount={tasks.length}
  />
</div>
          </div>
        </section>

        {/* ======================================
            04. ASSOCIATED TASKS
        ====================================== */}

        <section
          aria-labelledby="project-tasks-heading"
          className="space-y-5"
        >
          <div>
            <h3
              id="project-tasks-heading"
              className="text-xl font-semibold tracking-tight text-black sm:text-2xl"
            >
              Project tasks
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Review, prioritize, and complete work for this project.
            </p>
          </div>

          <TasksView
            tasks={tasks}
            projects={projectOptions}
            projectId={project.id}
          />
        </section>

      </div>
    </AppShell>
  );
}

/* ==========================================================
   SUMMARY CARD
   ========================================================== */

function SummaryCard({
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