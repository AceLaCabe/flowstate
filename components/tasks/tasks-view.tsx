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

function formatDueDate(date: string | null) {
  if (!date) return "No due date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
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

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "completed", label: "Completed" },
  { key: "high", label: "High Priority" },
  { key: "overdue", label: "Overdue" },
];

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
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                isActive
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black hover:bg-black/5",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Open Tasks</h3>
              <p className="mt-1 text-sm text-black/60">
                What needs attention next.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {openTasks.length}
            </span>
          </div>

          {openTasks.length > 0 ? (
            <div className="space-y-4">
              {openTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <div className="flex items-start gap-3">
                    <TaskToggleButton
                      taskId={task.id}
                      completed={task.completed}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-black">
                              {task.title}
                            </h4>

                            {isOverdue(task.due_date, task.completed) && (
                              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
                                Overdue
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-black/60">
                            {task.projects?.title ?? "No project"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyles(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-3 text-sm leading-6 text-black/65">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">No open tasks</p>
              <p className="mt-1 text-sm text-black/60">
                Create a task to start tracking your work.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Completed</h3>
              <p className="mt-1 text-sm text-black/60">
                Finished work and checked-off items.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {completedTasks.length}
            </span>
          </div>

          {completedTasks.length > 0 ? (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4 opacity-80"
                >
                  <div className="flex items-start gap-3">
                    <TaskToggleButton
                      taskId={task.id}
                      completed={task.completed}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold text-black line-through">
                            {task.title}
                          </h4>
                          <p className="mt-1 text-sm text-black/60">
                            {task.projects?.title ?? "No project"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyles(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-3 text-sm leading-6 text-black/65">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">Nothing completed yet</p>
              <p className="mt-1 text-sm text-black/60">
                Completed tasks will show up here once you start checking things
                off.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}