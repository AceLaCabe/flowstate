// components/tasks/tasks-view.tsx
"use client";

import { useMemo, useState } from "react";
import TaskToggleButton from "@/components/tasks/task-toggle-button";
import EditTaskForm from "@/components/tasks/edit-task-form";
import DeleteTaskButton from "@/components/tasks/delete-task-button";

type ProjectOption = {
  id: string;
  title: string;
};

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

type TasksViewProps = {
  tasks: TaskWithProject[];
  projects: ProjectOption[];
};

type FilterKey = "all" | "open" | "completed" | "high" | "overdue";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "completed", label: "Completed" },
  { key: "high", label: "High priority" },
  { key: "overdue", label: "Overdue" },
];

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

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-[#fff7ed] text-[#7b533e]";
  }
}

function getFilterCount(filterKey: FilterKey, tasks: TaskWithProject[]) {
  switch (filterKey) {
    case "open":
      return tasks.filter((task) => !task.completed).length;
    case "completed":
      return tasks.filter((task) => task.completed).length;
    case "high":
      return tasks.filter((task) => task.priority === "high").length;
    case "overdue":
      return tasks.filter((task) => isOverdue(task.due_date, task.completed))
        .length;
    default:
      return tasks.length;
  }
}

export default function TasksView({ tasks, projects }: TasksViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case "open":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      case "high":
        return tasks.filter((task) => task.priority === "high");
      case "overdue":
        return tasks.filter((task) => isOverdue(task.due_date, task.completed));
      default:
        return tasks;
    }
  }, [activeFilter, tasks]);

  const openTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = getFilterCount(filter.key, tasks);

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                isActive
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black hover:bg-black/5",
              ].join(" ")}
            >
              <span>{filter.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive ? "bg-white/15 text-white" : "bg-black/5 text-black/55",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyTaskState activeFilter={activeFilter} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <TaskColumn
            title="Open tasks"
            description="What still needs movement."
            count={openTasks.length}
            emptyTitle="No open tasks here"
            emptyDescription="This filter does not have any open tasks right now."
          >
            {openTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                completedView={false}
              />
            ))}
          </TaskColumn>

          <TaskColumn
            title="Completed"
            description="Closed loops and checked-off work."
            count={completedTasks.length}
            emptyTitle="Nothing completed here"
            emptyDescription="Completed tasks will collect here once you start checking things off."
          >
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                completedView
              />
            ))}
          </TaskColumn>
        </div>
      )}
    </div>
  );
}

function TaskColumn({
  title,
  description,
  count,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  description: string;
  count: number;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-black">
            {title}
          </h3>

          <p className="mt-1 text-sm text-black/60">{description}</p>
        </div>

        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
          {count}
        </span>
      </div>

      {count > 0 ? (
        <div className="space-y-4">{children}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
          <p className="text-sm font-semibold text-black">{emptyTitle}</p>

          <p className="mt-1 text-sm leading-6 text-black/60">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

function TaskCard({
  task,
  projects,
  completedView,
}: {
  task: TaskWithProject;
  projects: ProjectOption[];
  completedView: boolean;
}) {
  const overdue = isOverdue(task.due_date, task.completed);

  return (
    <article
      className={[
        "rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]",
        completedView ? "opacity-80" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <TaskToggleButton taskId={task.id} completed={task.completed} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={[
                    "text-base font-semibold text-black",
                    completedView ? "line-through" : "",
                  ].join(" ")}
                >
                  {task.title}
                </h4>

                {overdue ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                    Overdue
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-black/60">
                {task.projects?.title ?? "No project"}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityStyles(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description ? (
            <p className="mt-3 text-sm leading-6 text-black/65">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic leading-6 text-black/40">
              No extra notes.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/55">
              Due: {formatDueDate(task.due_date)}
            </p>

            <div className="flex flex-wrap gap-2">
              <EditTaskForm
                taskId={task.id}
                initialTitle={task.title}
                initialDescription={task.description}
                initialDueDate={task.due_date}
                initialPriority={task.priority}
                initialProjectId={task.project_id}
                projects={projects}
              />

              <DeleteTaskButton taskId={task.id} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyTaskState({ activeFilter }: { activeFilter: FilterKey }) {
  const copy: Record<FilterKey, { title: string; description: string }> = {
    all: {
      title: "No tasks yet",
      description:
        "Create your first task to give your project work a clear next action.",
    },
    open: {
      title: "No open tasks",
      description:
        "Everything is either complete or waiting to be created. That is a good kind of quiet.",
    },
    completed: {
      title: "Nothing completed yet",
      description:
        "Completed tasks will show here once you start closing loops.",
    },
    high: {
      title: "No high priority tasks",
      description:
        "Nothing is marked urgent right now. Keep the workspace calm.",
    },
    overdue: {
      title: "Nothing overdue",
      description:
        "No overdue tasks here. Your timeline has room to breathe.",
    },
  };

  return (
    <section className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-6">
      <p className="text-sm font-semibold text-black">{copy[activeFilter].title}</p>

      <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">
        {copy[activeFilter].description}
      </p>
    </section>
  );
}