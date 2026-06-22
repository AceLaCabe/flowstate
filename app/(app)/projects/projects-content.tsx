// // app/(app)/projects/projects-content.tsx
// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import AppShell from "@/components/layout/app-shell";
// import CreateProjectForm from "@/components/forms/create-project-form";

// function formatDueDate(date: string | null) {
//   if (!date) return "No due date";
//   return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// function getStatusStyles(status: string) {
//   switch (status) {
//     case "active":
//       return "bg-black text-white";
//     case "completed":
//       return "bg-green-100 text-green-800";
//     case "on_hold":
//       return "bg-yellow-100 text-yellow-800";
//     default:
//       return "bg-black/5 text-black/75";
//   }
// }

// export default async function ProjectsContent() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("first_name, last_name, avatar_url")
//     .eq("id", user.id)
//     .single();

//   const { data: workspace, error: workspaceError } = await supabase
//     .from("workspaces")
//     .select("id, name")
//     .eq("owner_id", user.id)
//     .maybeSingle();

//   if (workspaceError) {
//     throw new Error(`Workspace lookup failed: ${workspaceError.message}`);
//   }

//   if (!workspace) {
//     redirect("/dashboard");
//   }

//   const { data: projects, error: projectsError } = await supabase
//     .from("projects")
//     .select("id, title, description, status, due_date, created_at")
//     .eq("workspace_id", workspace.id)
//     .order("created_at", { ascending: false });

//   if (projectsError) {
//     throw new Error(`Projects load failed: ${projectsError.message}`);
//   }

//   return (
//     <AppShell
//       firstName={profile?.first_name ?? "User"}
//       lastName={profile?.last_name ?? ""}
//       avatarUrl={profile?.avatar_url ?? null}
//     >
//       <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-sm text-black/65">Project planning</p>
//           <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
//             Projects
//           </h2>
//           <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
//             Organize client work, creative initiatives, launches, and personal goals in one calm workspace.
//           </p>
//         </div>

//         <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
//           <p className="text-xs uppercase tracking-[0.18em] text-black/45">
//             Workspace
//           </p>
//           <p className="mt-1 text-sm font-medium text-black">{workspace.name}</p>
//         </div>
//       </div>

//       <div className="mb-8">
//         <CreateProjectForm workspaceId={workspace.id} />
//       </div>

//       {projects && projects.length > 0 ? (
//         <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
//           {projects.map((project) => (
//             <article
//               key={project.id}
//               className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0">
//                   <h3 className="truncate text-xl font-semibold text-black">
//                     {project.title}
//                   </h3>
//                   <p className="mt-1 text-sm text-black/55">
//                     {formatDueDate(project.due_date)}
//                   </p>
//                 </div>

//                 <span
//                   className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(
//                     project.status
//                   )}`}
//                 >
//                   {project.status === "on_hold" ? "On hold" : project.status}
//                 </span>
//               </div>

//               <p className="mt-4 text-sm leading-6 text-black/70">
//                 {project.description?.trim() || "No description yet."}
//               </p>
//             </article>
//           ))}
//         </div>
//       ) : (
//         <section className="rounded-2xl border border-dashed border-black/15 bg-white p-8 shadow-sm">
//           <h3 className="text-xl font-semibold text-black">No projects yet</h3>
//           <p className="mt-2 max-w-xl text-sm leading-6 text-black/65">
//             Create your first project to start organizing tasks, deadlines, assets, and team collaboration inside Flowstate.
//           </p>
//         </section>
//       )}
//     </AppShell>
//   );
// }

// app/(app)/projects/projects-content.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateProjectForm from "@/components/forms/create-project-form";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
};

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isProjectOverdue(project: Project) {
  if (!project.due_date || project.status === "completed") return false;

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const due = new Date(`${project.due_date}T00:00:00`);

  return due < todayOnly;
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
    .maybeSingle();

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

  const normalizedProjects = (projects ?? []) as Project[];

  const activeProjects = normalizedProjects.filter(
    (project) => project.status === "active"
  );

  const completedProjects = normalizedProjects.filter(
    (project) => project.status === "completed"
  );

  const onHoldProjects = normalizedProjects.filter(
    (project) => project.status === "on_hold"
  );

  const overdueProjects = normalizedProjects.filter(isProjectOverdue);

  const upcomingProjects = normalizedProjects
    .filter((project) => project.due_date && project.status !== "completed")
    .sort((a, b) => {
      const aTime = new Date(`${a.due_date}T00:00:00`).getTime();
      const bTime = new Date(`${b.due_date}T00:00:00`).getTime();
      return aTime - bTime;
    });

  const nextProject = overdueProjects[0] ?? upcomingProjects[0] ?? activeProjects[0];

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Project planning
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Projects
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Organize client work, creative initiatives, launches, and
              personal plans into clear project spaces.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Next planning move
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                {nextProject
                  ? `Focus on “${nextProject.title}” next. It is ${
                      isProjectOverdue(nextProject)
                        ? "past due"
                        : nextProject.due_date
                          ? `due ${formatDueDate(nextProject.due_date)}`
                          : "ready for a next step"
                    }.`
                  : "Create your first project to give your tasks, deadlines, and notes a place to land."}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">
              Current workspace
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              {workspace.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              {normalizedProjects.length > 0
                ? `${normalizedProjects.length} project${
                    normalizedProjects.length === 1 ? "" : "s"
                  } organized here.`
                : "A clean workspace, ready for your first project."}
            </p>

            <div className="mt-5">
              <CreateProjectForm workspaceId={workspace.id} />
            </div>
          </div>
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
            description="Needs attention"
            warm={overdueProjects.length > 0}
          />
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">
                Project spaces
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Your current work
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                A calm overview of what is active, paused, completed, or waiting
                for a clearer next step.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {normalizedProjects.length} total
            </span>
          </div>

          {normalizedProjects.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {normalizedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState />
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}

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

function ProjectCard({ project }: { project: Project }) {
  const overdue = isProjectOverdue(project);

  return (
    <article className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold tracking-tight text-black">
            {project.title}
          </h4>

          <p className="mt-1 text-sm text-black/55">
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
          "No description yet. Add notes, context, or a clear next step when you are ready."}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            overdue
              ? "bg-red-100 text-red-700"
              : "bg-white text-black/60"
          }`}
        >
          {overdue ? "Past due" : "Project"}
        </span>

        <span className="text-xs font-medium text-black/45">
          Created {formatDueDate(project.created_at?.slice(0, 10) ?? null)}
        </span>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
        Empty workspace
      </p>

      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-black">
        No projects yet
      </h3>

      <p className="mt-2 max-w-xl text-sm leading-6 text-black/65">
        Create your first project to start organizing tasks, deadlines, assets,
        and collaboration inside Flowstate.
      </p>
    </section>
  );
}