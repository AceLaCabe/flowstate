// // app/(app)/dashboard/dashboard-content.tsx

// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { createClient } from "@/lib/supabase/server";
// import AppShell from "@/components/layout/app-shell";

// function formatDueDate(date: string | null) {
//   if (!date) return "No due date";
//   return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// function isOverdue(dueDate: string | null, completed: boolean) {
//   if (!dueDate || completed) return false;

//   const today = new Date();
//   const todayOnly = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate()
//   );
//   const due = new Date(`${dueDate}T00:00:00`);

//   return due < todayOnly;
// }

// type ProjectSummary = {
//   id: string;
//   title: string;
//   status: string;
//   due_date: string | null;
//   created_at: string;
// };

// type TaskSummary = {
//   id: string;
//   title: string;
//   completed: boolean;
//   due_date: string | null;
//   priority: string;
//   created_at: string;
//   projects: {
//     id: string;
//     title: string;
//     workspace_id?: string;
//   }[];
// };

// export default async function DashboardContent() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   const { data: profile, error: profileError } = await supabase
//     .from("profiles")
//     .select("first_name, last_name, avatar_url")
//     .eq("id", user.id)
//     .single();

//   if (profileError) {
//     throw new Error(`Profile load failed: ${profileError.message}`);
//   }

//   const { data: existingWorkspace, error: workspaceLookupError } = await supabase
//     .from("workspaces")
//     .select("id, name")
//     .eq("owner_id", user.id)
//     .maybeSingle();

//   if (workspaceLookupError) {
//     throw new Error(`Workspace lookup failed: ${workspaceLookupError.message}`);
//   }

//   let workspaceId = existingWorkspace?.id ?? null;
//   let workspaceName = existingWorkspace?.name ?? null;

//   if (!workspaceId) {
//     const defaultWorkspaceName = profile?.first_name
//       ? `${profile.first_name}'s Workspace`
//       : "My Workspace";

//     const { data: newWorkspace, error: createWorkspaceError } = await supabase
//       .from("workspaces")
//       .insert({
//         name: defaultWorkspaceName,
//         owner_id: user.id,
//       })
//       .select("id, name")
//       .single();

//     if (createWorkspaceError) {
//       throw new Error(`Workspace creation failed: ${createWorkspaceError.message}`);
//     }

//     workspaceId = newWorkspace.id;
//     workspaceName = newWorkspace.name;

//     const { error: memberError } = await supabase.from("workspace_members").insert({
//       workspace_id: workspaceId,
//       user_id: user.id,
//       role: "owner",
//     });

//     if (memberError) {
//       throw new Error(`Workspace membership creation failed: ${memberError.message}`);
//     }
//   }

//   const { data: projects, error: projectsError } = await supabase
//     .from("projects")
//     .select("id, title, status, due_date, created_at")
//     .eq("workspace_id", workspaceId)
//     .order("created_at", { ascending: false });

//   if (projectsError) {
//     throw new Error(`Projects load failed: ${projectsError.message}`);
//   }

//   const { data: tasks, error: tasksError } = await supabase
//     .from("tasks")
//     .select(
//       "id, title, completed, due_date, priority, created_at, projects!inner(id, title, workspace_id)"
//     )
//     .eq("projects.workspace_id", workspaceId)
//     .order("created_at", { ascending: false });

//   if (tasksError) {
//     throw new Error(`Tasks load failed: ${tasksError.message}`);
//   }

//   const { data: events, error: eventsError } = await supabase
//     .from("events")
//     .select("id")
//     .eq("workspace_id", workspaceId);

//   if (eventsError) {
//     throw new Error(`Events load failed: ${eventsError.message}`);
//   }

//   const { data: members, error: membersError } = await supabase
//     .from("workspace_members")
//     .select("id")
//     .eq("workspace_id", workspaceId);

//   if (membersError) {
//     throw new Error(`Workspace members load failed: ${membersError.message}`);
//   }

//   const normalizedProjects = (projects ?? []) as ProjectSummary[];
//   const normalizedTasks = (tasks ?? []) as unknown as TaskSummary[];

//   const activeProjects = normalizedProjects.filter(
//     (project) => project.status === "active"
//   );
//   const openTasks = normalizedTasks.filter((task) => !task.completed);
//   const highPriorityTasks = openTasks.filter((task) => task.priority === "high");
//   const overdueTasks = openTasks.filter((task) =>
//     isOverdue(task.due_date, task.completed)
//   );

//   const dueSoonTasks = openTasks
//     .filter((task) => task.due_date)
//     .sort((a, b) => {
//       const aTime = new Date(`${a.due_date}T00:00:00`).getTime();
//       const bTime = new Date(`${b.due_date}T00:00:00`).getTime();
//       return aTime - bTime;
//     })
//     .slice(0, 4);

//   const recentProjects = normalizedProjects.slice(0, 3);

//   return (
//     <AppShell
//       firstName={profile?.first_name ?? "User"}
//       lastName={profile?.last_name ?? ""}
//       avatarUrl={profile?.avatar_url ?? null}
//     >
//       <div className="mb-6 sm:mb-8">
//         <p className="text-sm text-black/65">Workspace overview</p>
//         <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
//           Let’s get you into flow.
//         </h2>
//         <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
//           Organize your projects, tasks, meetings, and assets in one calm workspace.
//         </p>
//       </div>

//       <div className="mb-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
//         <p className="text-sm text-black/55">Current workspace</p>
//         <h3 className="mt-2 text-2xl font-semibold text-black">
//           {workspaceName ?? "My Workspace"}
//         </h3>
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
//           <h3 className="text-sm font-medium text-black/70">Active Projects</h3>
//           <p className="mt-3 text-3xl font-semibold text-black">
//             {activeProjects.length}
//           </p>
//           <p className="mt-2 text-sm text-black/55">Projects currently in progress</p>
//         </section>

//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
//           <h3 className="text-sm font-medium text-black/70">Open Tasks</h3>
//           <p className="mt-3 text-3xl font-semibold text-black">
//             {openTasks.length}
//           </p>
//           <p className="mt-2 text-sm text-black/55">Tasks still in motion</p>
//         </section>

//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
//           <h3 className="text-sm font-medium text-black/70">Overdue Tasks</h3>
//           <p className="mt-3 text-3xl font-semibold text-black">
//             {overdueTasks.length}
//           </p>
//           <p className="mt-2 text-sm text-black/55">Past due and unfinished</p>
//         </section>

//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
//           <h3 className="text-sm font-medium text-black/70">Team Members</h3>
//           <p className="mt-3 text-3xl font-semibold text-black">
//             {members?.length ?? 0}
//           </p>
//           <p className="mt-2 text-sm text-black/55">People in this workspace</p>
//         </section>
//       </div>

//       <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//             <div>
//               <h3 className="text-xl font-semibold text-black">Due Soon</h3>
//               <p className="mt-2 text-black/70">
//                 Your nearest upcoming task deadlines.
//               </p>
//             </div>
//             <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
//               Live
//             </span>
//           </div>

//           <div className="mt-6 space-y-4">
//             {dueSoonTasks.length > 0 ? (
//               dueSoonTasks.map((task) => (
//                 <div
//                   key={task.id}
//                   className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
//                 >
//                   <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-black">{task.title}</p>
//                       <p className="mt-1 text-sm text-black/60">
//                         {task.projects?.[0]?.title ?? "No project"}
//                       </p>
//                     </div>

//                     <div className="flex flex-wrap gap-2">
//                       {task.priority === "high" && (
//                         <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
//                           High
//                         </span>
//                       )}
//                       {isOverdue(task.due_date, task.completed) && (
//                         <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
//                           Overdue
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <p className="mt-3 text-sm text-black/55">
//                     Due: {formatDueDate(task.due_date)}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
//                 <p className="text-sm font-medium text-black">Nothing due soon</p>
//                 <p className="mt-1 text-sm text-black/60">
//                   Create tasks with due dates to see upcoming priorities here.
//                 </p>
//               </div>
//             )}
//           </div>
//         </section>

//         <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
//           <h3 className="text-xl font-semibold text-black">Quick Snapshot</h3>
//           <p className="mt-2 text-sm text-black/65">
//             The most important signals from your workspace.
//           </p>

//           <div className="mt-5 space-y-4">
//             <div className="rounded-xl bg-[#fafaf7] p-4">
//               <p className="text-sm text-black/55">High Priority</p>
//               <p className="mt-2 text-2xl font-semibold text-black">
//                 {highPriorityTasks.length}
//               </p>
//             </div>

//             <div className="rounded-xl bg-[#fafaf7] p-4">
//               <p className="text-sm text-black/55">Upcoming Events</p>
//               <p className="mt-2 text-2xl font-semibold text-black">
//                 {events?.length ?? 0}
//               </p>
//             </div>

//             <div className="rounded-xl bg-[#fafaf7] p-4">
//               <p className="text-sm text-black/55">Recent Projects</p>
//               <p className="mt-2 text-2xl font-semibold text-black">
//                 {recentProjects.length}
//               </p>
//             </div>
//           </div>

//           <div className="mt-6 space-y-3">
//             <Link
//               href="/projects"
//               className="block w-full rounded-xl bg-black px-4 py-3 text-left text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
//             >
//               Go to Projects
//             </Link>

//             <Link
//               href="/tasks"
//               className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
//             >
//               View Tasks
//             </Link>

//             <Link
//               href="/calendar"
//               className="block w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-left text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
//             >
//               View Calendar
//             </Link>
//           </div>
//         </section>
//       </div>

//       <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <h3 className="text-xl font-semibold text-black">Recent Projects</h3>
//             <p className="mt-2 text-black/70">
//               Your newest project spaces and current momentum.
//             </p>
//           </div>
//           <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
//             Workspace
//           </span>
//         </div>

//         <div className="mt-6 grid gap-4 lg:grid-cols-3">
//           {recentProjects.length > 0 ? (
//             recentProjects.map((project) => (
//               <div
//                 key={project.id}
//                 className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
//               >
//                 <p className="text-base font-semibold text-black">{project.title}</p>
//                 <p className="mt-2 text-sm capitalize text-black/60">
//                   {project.status === "on_hold" ? "On hold" : project.status}
//                 </p>
//                 <p className="mt-3 text-sm text-black/55">
//                   Due: {formatDueDate(project.due_date)}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4 lg:col-span-3">
//               <p className="text-sm font-medium text-black">No projects yet</p>
//               <p className="mt-1 text-sm text-black/60">
//                 Create your first project to start filling your dashboard with live data.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </AppShell>
//   );
// }

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

function getStatusLabel(status: string) {
  if (status === "on_hold") return "On hold";
  return status.replaceAll("_", " ");
}

function getProjectTitle(projects: TaskSummary["projects"]) {
  if (Array.isArray(projects)) {
    return projects[0]?.title ?? "No project";
  }

  return projects?.title ?? "No project";
}

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

type TaskProject =
  | {
      id: string;
      title: string;
      workspace_id?: string;
    }
  | {
      id: string;
      title: string;
      workspace_id?: string;
    }[]
  | null;

type TaskSummary = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  projects: TaskProject;
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
    .maybeSingle();

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

  const highPriorityTasks = openTasks.filter(
    (task) => task.priority === "high"
  );

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

  const nextFocusTask =
    overdueTasks[0] ?? dueSoonTasks[0] ?? highPriorityTasks[0] ?? openTasks[0];

  const firstName = profile?.first_name ?? "User";
  const lastName = profile?.last_name ?? "";
  const teamCount = members?.length ?? 0;
  const eventCount = events?.length ?? 0;

  return (
    <AppShell
      firstName={firstName}
      lastName={lastName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Workspace overview
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Let’s get you into flow, {firstName}.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Start with the clearest next move, then return to the bigger
              picture when you’re ready.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Open projects
              </Link>

              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-[#fafaf7] px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Review tasks
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">
              Current workspace
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              {workspaceName ?? "My Workspace"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              {activeProjects.length > 0
                ? `${activeProjects.length} active project${
                    activeProjects.length === 1 ? "" : "s"
                  } currently moving.`
                : "A clean space, ready for your first active project."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active projects"
            value={activeProjects.length}
            description="Projects currently in progress"
          />

          <MetricCard
            label="Open tasks"
            value={openTasks.length}
            description="Tasks still in motion"
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

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-black/55">
                  One next action
                </p>

                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                  {nextFocusTask ? nextFocusTask.title : "No urgent task waiting"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/65">
                  {nextFocusTask
                    ? `${getProjectTitle(
                        nextFocusTask.projects
                      )} • Due ${formatDueDate(nextFocusTask.due_date)}`
                    : "Create a project or task when you’re ready to start building momentum."}
                </p>
              </div>

              {nextFocusTask ? (
                <TaskBadge
                  priority={nextFocusTask.priority}
                  overdue={isOverdue(
                    nextFocusTask.due_date,
                    nextFocusTask.completed
                  )}
                />
              ) : (
                <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
                  Clear
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Calm plan
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                {overdueTasks.length > 0
                  ? "Start with the overdue item first. One completed task will lower the noise."
                  : nextFocusTask
                    ? "Work this task before opening a new thread. Keep the next move small."
                    : "Your dashboard is quiet. Add the next project, task, or meeting when you need it."}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                View tasks
              </Link>

              <Link
                href="/calendar"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Check calendar
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-black/55">
              Quick snapshot
            </p>

            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
              Workspace signals
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/65">
              The clearest indicators from your current workspace.
            </p>

            <div className="mt-5 space-y-3">
              <SnapshotRow label="High priority" value={highPriorityTasks.length} />
              <SnapshotRow label="Upcoming events" value={eventCount} />
              <SnapshotRow label="Recent projects" value={recentProjects.length} />
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
              <p className="text-sm font-semibold text-black">
                Less scattered, more visible.
              </p>

              <p className="mt-1 text-sm leading-6 text-black/60">
                Flowstate keeps the work visible without forcing every detail
                into your face at once.
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">Due soon</p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Upcoming task deadlines
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                A short list of the nearest tasks that need attention.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {dueSoonTasks.length} shown
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {dueSoonTasks.length > 0 ? (
              dueSoonTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <EmptyState
                title="Nothing due soon"
                description="Create tasks with due dates to see upcoming priorities here."
                actionHref="/tasks"
                actionLabel="Go to tasks"
              />
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">
                Recent projects
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Current project spaces
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Your newest project spaces and current momentum.
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70 transition hover:bg-black/10"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first project to start filling your dashboard with live data."
                actionHref="/projects"
                actionLabel="Go to projects"
              />
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

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

function SnapshotRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#fafaf7] px-4 py-3">
      <span className="text-sm font-medium text-black/65">{label}</span>
      <span className="text-lg font-semibold text-black">{value}</span>
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

function TaskCard({ task }: { task: TaskSummary }) {
  const overdue = isOverdue(task.due_date, task.completed);

  return (
    <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-black">{task.title}</p>

          <p className="mt-1 text-sm text-black/60">
            {getProjectTitle(task.projects)}
          </p>
        </div>

        <TaskBadge priority={task.priority} overdue={overdue} />
      </div>

      <p className="mt-3 text-sm text-black/55">
        Due: {formatDueDate(task.due_date)}
      </p>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-black">{project.title}</p>

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
      <p className="text-sm font-semibold text-black">{title}</p>

      <p className="mt-1 max-w-xl text-sm leading-6 text-black/60">
        {description}
      </p>

      <Link
        href={actionHref}
        className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black/5"
      >
        {actionLabel}
      </Link>
    </div>
  );
}