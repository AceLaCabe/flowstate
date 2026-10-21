// components/tasks/tasks-view.tsx

"use client";

import { useMemo, useState } from "react";

import TaskToggleButton from "@/components/tasks/task-toggle-button";
import EditTaskForm from "@/components/tasks/edit-task-form";
import DeleteTaskButton from "@/components/tasks/delete-task-button";

/* ==========================================================
   TYPES
========================================================== */

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
  projectId?: string;
};

type FilterKey =
  | "all"
  | "open"
  | "completed"
  | "high"
  | "overdue";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "completed", label: "Completed" },
  { key: "high", label: "High priority" },
  { key: "overdue", label: "Overdue" },
];

const priorityRank: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
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

function getTodayKey() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function isOverdue(
  dueDate: string | null,
  completed: boolean,
  todayKey: string
) {
  return Boolean(
    dueDate && !completed && dueDate < todayKey
  );
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

function sortOpenTasks(
  tasks: TaskWithProject[],
  todayKey: string
) {
  return [...tasks].sort((a, b) => {
    // 1. Overdue tasks first.
    const aOverdue = isOverdue(
      a.due_date,
      a.completed,
      todayKey
    );
    const bOverdue = isOverdue(
      b.due_date,
      b.completed,
      todayKey
    );

    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }

    // 2. Higher priority first.
    const aRank = priorityRank[a.priority] ?? 3;
    const bRank = priorityRank[b.priority] ?? 3;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    // 3. Earlier due dates first.
    if (a.due_date && b.due_date) {
      const dateComparison =
        a.due_date.localeCompare(b.due_date);

      if (dateComparison !== 0) {
        return dateComparison;
      }
    } else if (a.due_date && !b.due_date) {
      return -1;
    } else if (!a.due_date && b.due_date) {
      return 1;
    }

    // 4. Most recently created first.
    return b.created_at.localeCompare(a.created_at);
  });
}

function getFilterCount(
  filterKey: FilterKey,
  tasks: TaskWithProject[],
  todayKey: string
) {
  switch (filterKey) {
    case "open":
      return tasks.filter(
        (task) => !task.completed
      ).length;

    case "completed":
      return tasks.filter(
        (task) => task.completed
      ).length;

    case "high":
      return tasks.filter(
        (task) =>
          !task.completed &&
          task.priority === "high"
      ).length;

    case "overdue":
      return tasks.filter((task) =>
        isOverdue(
          task.due_date,
          task.completed,
          todayKey
        )
      ).length;

    default:
      return tasks.length;
  }
}

/* ==========================================================
   TASKS VIEW
========================================================== */

export default function TasksView({
  tasks,
  projects,
  projectId,
}: TasksViewProps) {
  const [activeFilter, setActiveFilter] =
    useState<FilterKey>("all");

  const [showCompleted, setShowCompleted] =
    useState(false);

  const todayKey = getTodayKey();

  /* --------------------------------------------------------
     PROJECT SCOPE
  -------------------------------------------------------- */

  const scopedTasks = useMemo(() => {
    if (!projectId) return tasks;

    return tasks.filter(
      (task) => task.project_id === projectId
    );
  }, [tasks, projectId]);

  /* --------------------------------------------------------
     FILTER TASKS
  -------------------------------------------------------- */

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case "open":
        return scopedTasks.filter(
          (task) => !task.completed
        );

      case "completed":
        return scopedTasks.filter(
          (task) => task.completed
        );

      case "high":
        return scopedTasks.filter(
          (task) =>
            !task.completed &&
            task.priority === "high"
        );

      case "overdue":
        return scopedTasks.filter((task) =>
          isOverdue(
            task.due_date,
            task.completed,
            todayKey
          )
        );

      default:
        return scopedTasks;
    }
  }, [activeFilter, scopedTasks, todayKey]);

  /* --------------------------------------------------------
     GROUP AND SORT
  -------------------------------------------------------- */

  const openTasks = useMemo(() => {
    return sortOpenTasks(
      filteredTasks.filter(
        (task) => !task.completed
      ),
      todayKey
    );
  }, [filteredTasks, todayKey]);

  const completedTasks = useMemo(() => {
    return filteredTasks
      .filter((task) => task.completed)
      .sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      );
  }, [filteredTasks]);

  // The Completed filter always shows its results.
  const completedExpanded =
    activeFilter === "completed" || showCompleted;

  function changeFilter(filter: FilterKey) {
    setActiveFilter(filter);
  }

  const hasResults = filteredTasks.length > 0;

  return (
    <div className="space-y-6">

      {/* ======================================
          FILTERS
      ====================================== */}

      <div
        role="group"
        aria-label="Filter tasks"
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const isActive =
            activeFilter === filter.key;

          const count = getFilterCount(
            filter.key,
            scopedTasks,
            todayKey
          );

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() =>
                changeFilter(filter.key)
              }
              aria-pressed={isActive}
              className={[
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
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
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-black/5 text-black/55",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================
          EMPTY FILTER STATE
      ====================================== */}

      {!hasResults ? (
        <EmptyTaskState
          activeFilter={activeFilter}
        />
      ) : (
        <div className="space-y-5">

          {/* ======================================
              OPEN TASKS
          ====================================== */}

          {activeFilter !== "completed" && (
            <section
              aria-labelledby="open-tasks-heading"
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3
                    id="open-tasks-heading"
                    className="text-xl font-semibold tracking-tight text-black"
                  >
                    Open tasks
                  </h3>

                  <p className="mt-1 text-sm text-black/60">
                    The work that still needs movement.
                  </p>
                </div>

                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                  {openTasks.length} remaining
                </span>
              </div>

              {openTasks.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {openTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      todayKey={todayKey}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
                  <p className="text-sm font-semibold text-black">
                    No open tasks here
                  </p>

                  <p className="mt-2 text-sm leading-6 text-black/60">
                    Nothing needs attention in this view.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ======================================
              COMPLETED TASKS
          ====================================== */}

          {(activeFilter === "all" ||
            activeFilter === "completed") &&
            completedTasks.length > 0 && (
              <section
                aria-labelledby="completed-tasks-heading"
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <h3
                      id="completed-tasks-heading"
                      className="text-base font-semibold text-black"
                    >
                      Completed tasks
                    </h3>

                    <p className="mt-1 text-sm text-black/55">
                      Work you've already finished.
                    </p>
                  </div>

                  {activeFilter === "completed" ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      {completedTasks.length} done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowCompleted((value) => !value)
                      }
                      aria-expanded={completedExpanded}
                      aria-controls="completed-task-list"
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    >
                      <span>{completedTasks.length}</span>
                      <span>
                        {completedExpanded
                          ? "Hide"
                          : "Show"}
                      </span>
                      <span aria-hidden="true">
                        {completedExpanded ? "↑" : "↓"}
                      </span>
                    </button>
                  )}
                </div>

                {completedExpanded && (
                  <div
                    id="completed-task-list"
                    className="border-t border-black/10 px-4 pb-4 pt-5 sm:px-5 sm:pb-5"
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          projects={projects}
                          todayKey={todayKey}
                          completedView
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   TASK CARD
========================================================== */

function TaskCard({
  task,
  projects,
  todayKey,
  completedView = false,
}: {
  task: TaskWithProject;
  projects: ProjectOption[];
  todayKey: string;
  completedView?: boolean;
}) {
  const overdue = isOverdue(
    task.due_date,
    task.completed,
    todayKey
  );

  return (
    <article
      className={[
        "rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition",
        "hover:border-black/20 hover:shadow-sm",
        completedView ? "opacity-80" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">

        <TaskToggleButton
          taskId={task.id}
          completed={task.completed}
        />

        <div className="min-w-0 flex-1">

          {/* TASK TITLE AND PRIORITY */}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={[
                    "break-words text-base font-semibold text-black",
                    completedView
                      ? "line-through"
                      : "",
                  ].join(" ")}
                >
                  {task.title}
                </h4>

                {overdue && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                    Overdue
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-black/60">
                {task.projects?.title ?? "No project"}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityStyles(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {/* DESCRIPTION */}

          {task.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/65">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic leading-6 text-black/40">
              No extra notes.
            </p>
          )}

          {/* TASK ACTIONS */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
            <p className="text-sm text-black/55">
              Due: {formatDueDate(task.due_date)}
            </p>

            <div className="flex flex-wrap items-center gap-2">
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

/* ==========================================================
   EMPTY STATES
========================================================== */

function EmptyTaskState({
  activeFilter,
}: {
  activeFilter: FilterKey;
}) {
  const copy: Record<
    FilterKey,
    {
      title: string;
      description: string;
    }
  > = {
    all: {
      title: "No tasks yet",
      description:
        "Create your first task to give your project work a clear next action.",
    },

    open: {
      title: "No open tasks",
      description:
        "Everything is complete or waiting to be created.",
    },

    completed: {
      title: "Nothing completed yet",
      description:
        "Completed tasks will appear here once you start checking things off.",
    },

    high: {
      title: "No high-priority tasks",
      description:
        "You don't have any open high-priority tasks right now.",
    },

    overdue: {
      title: "Nothing overdue",
      description:
        "No unfinished tasks are past their due date.",
    },
  };

  return (
    <section className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-6">
      <p className="text-sm font-semibold text-black">
        {copy[activeFilter].title}
      </p>

      <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">
        {copy[activeFilter].description}
      </p>
    </section>
  );
}