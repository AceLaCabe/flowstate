// components/forms/create-task-form.tsx

"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ==========================================================
   TYPES
   ========================================================== */

type ProjectOption = {
  id: string;
  title: string;
};

type TaskPriority = "low" | "medium" | "high";

type CreateTaskFormProps = {
  projects: ProjectOption[];
  defaultProjectId?: string;
};

/* ==========================================================
   CREATE TASK FORM
   ========================================================== */

export default function CreateTaskForm({
  projects,
  defaultProjectId,
}: CreateTaskFormProps) {
  const router = useRouter();

  const titleRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // A project page can preselect and lock its own project.
  const selectedProject = defaultProjectId
    ? projects.find((project) => project.id === defaultProjectId)
    : null;

  const isProjectLocked = Boolean(selectedProject);

  const initialProjectId =
    selectedProject?.id ?? projects[0]?.id ?? "";

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(initialProjectId);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* --------------------------------------------------------
     FOCUS MANAGEMENT
     -------------------------------------------------------- */

  useEffect(() => {
    if (isExpanded) {
      titleRef.current?.focus();
    }
  }, [isExpanded]);

  /* --------------------------------------------------------
     FORM UTILITIES
     -------------------------------------------------------- */

  function clearFields() {
    setTitle("");
    setDescription("");
    setProjectId(initialProjectId);
    setDueDate("");
    setPriority("medium");
    setError(null);
  }

  function openForm() {
    clearFields();
    setSuccess(null);
    setIsExpanded(true);
  }

  function cancelForm() {
    if (isSubmitting) return;

    clearFields();
    setIsExpanded(false);

    requestAnimationFrame(() => {
      openButtonRef.current?.focus();
    });
  }

  /* --------------------------------------------------------
     TASK CREATION
     -------------------------------------------------------- */

  async function handleCreateTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // Enforce the selected project when inside a project page.
    const targetProjectId = isProjectLocked
      ? selectedProject!.id
      : projectId;

    setError(null);
    setSuccess(null);

    if (!trimmedTitle) {
      setError("Enter a task title to continue.");
      titleRef.current?.focus();
      return;
    }

    if (
      !targetProjectId ||
      !projects.some(
        (project) => project.id === targetProjectId
      )
    ) {
      setError("Select a valid project for this task.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from("tasks")
        .insert({
          title: trimmedTitle,
          description: trimmedDescription || null,
          project_id: targetProjectId,
          due_date: dueDate || null,
          priority,
        });

      if (insertError) {
        console.error(
          "Task creation failed:",
          insertError.message
        );

        setError(
          "The task couldn't be saved. Please try again."
        );
        return;
      }

      clearFields();
      setIsExpanded(false);

      setSuccess(
        `"${trimmedTitle}" was created successfully.`
      );

      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Unexpected task creation error:",
        unexpectedError
      );

      setError(
        "Something went wrong while saving your task. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ========================================================
     EMPTY PROJECT STATE
     ======================================================== */

  if (projects.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#d7bfa8]/70 bg-white/70 p-5">
        <h3 className="text-base font-semibold text-[#3b2418]">
          Create a project first
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#7b533e]">
          Every task belongs to a project. Create one
          to start organizing your next actions.
        </p>

        <Link
          href="/projects"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#fff7ed] px-4 py-2 text-sm font-semibold text-[#3b2418] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Go to projects
        </Link>
      </section>
    );
  }

  /* ========================================================
     FORM INTERFACE
     ======================================================== */

  return (
    <div>

      {/* ----------------------------------------
          COLLAPSED STATE
      ---------------------------------------- */}

      {!isExpanded && (
        <>
          <button
            ref={openButtonRef}
            type="button"
            onClick={openForm}
            aria-expanded={false}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:w-auto"
          >
            + New task
          </button>

          {success && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
            >
              {success}
            </p>
          )}
        </>
      )}

      {/* ----------------------------------------
          EXPANDED STATE
      ---------------------------------------- */}

      {isExpanded && (
        <section
          aria-labelledby="create-task-heading"
          className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-black/55">
                New task
              </p>

              <h3
                id="create-task-heading"
                className="mt-1 text-xl font-semibold tracking-tight text-black"
              >
                Create a next action
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Keep it specific, manageable, and connected
                to the bigger picture.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelForm}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleCreateTask}
            className="space-y-5"
          >

            {/* TASK TITLE */}

            <div className="grid gap-2">
              <label
                htmlFor="task-title"
                className="text-sm font-semibold text-black"
              >
                Task title{" "}
                <span className="text-[#7b533e]">*</span>
              </label>

              <input
                ref={titleRef}
                id="task-title"
                name="title"
                type="text"
                required
                maxLength={120}
                autoComplete="off"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError(null);
                }}
                placeholder="Review homepage wireframes"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="grid gap-2">
              <label
                htmlFor="task-description"
                className="text-sm font-semibold text-black"
              >
                Description{" "}
                <span className="font-normal text-black/50">
                  (optional)
                </span>
              </label>

              <textarea
                id="task-description"
                name="description"
                rows={3}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add context, notes, or details."
                disabled={isSubmitting}
                className="w-full resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* PROJECT, DATE AND PRIORITY */}

            <div className="grid gap-4 sm:grid-cols-3">

              <div className="grid gap-2">
                <label
                  htmlFor="task-project"
                  className="text-sm font-semibold text-black"
                >
                  Project
                </label>

                {isProjectLocked ? (
                  <div
                    id="task-project"
                    className="flex min-h-12 items-center rounded-xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm text-black/75"
                  >
                    {selectedProject?.title}
                  </div>
                ) : (
                  <select
                    id="task-project"
                    name="project_id"
                    value={projectId}
                    onChange={(event) => {
                      setProjectId(event.target.value);
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                  >
                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="task-due-date"
                  className="text-sm font-semibold text-black"
                >
                  Due date{" "}
                  <span className="font-normal text-black/50">
                    (optional)
                  </span>
                </label>

                <input
                  id="task-due-date"
                  name="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="task-priority"
                  className="text-sm font-semibold text-black"
                >
                  Priority
                </label>

                <select
                  id="task-priority"
                  name="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as TaskPriority
                    )
                  }
                  disabled={isSubmitting}
                  className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* ERROR FEEDBACK */}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            {/* SUBMIT */}

            <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                {isSubmitting
                  ? "Creating task..."
                  : "Create task"}
              </button>

              <p className="text-xs text-black/50">
                Only the task title and project are required.
              </p>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}