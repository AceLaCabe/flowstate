// components/forms/create-project-form.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateProjectFormProps = {
  workspaceId: string;
};

type ProjectStatus = "active" | "on_hold" | "completed";

export default function CreateProjectForm({
  workspaceId,
}: CreateProjectFormProps) {
  const router = useRouter();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] =
    useState<ProjectStatus>("active");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isExpanded) {
      titleInputRef.current?.focus();
    }
  }, [isExpanded]);

  function clearFields() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("active");
    setError(null);
  }

  function openForm() {
    setSuccess(null);
    setError(null);
    setIsExpanded(true);
  }

  function cancelForm() {
    if (isPending) return;

    clearFields();
    setIsExpanded(false);

    requestAnimationFrame(() => {
      openButtonRef.current?.focus();
    });
  }

  async function handleCreateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setError(null);
    setSuccess(null);

    if (!trimmedTitle) {
      setError("Enter a project title to continue.");
      titleInputRef.current?.focus();
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();

        const { error: insertError } = await supabase
          .from("projects")
          .insert({
            workspace_id: workspaceId,
            title: trimmedTitle,
            description: trimmedDescription || null,
            due_date: dueDate || null,
            status,
          });

        if (insertError) {
          setError(
            "Your project could not be created. Please try again."
          );

          console.error(
            "Project creation failed:",
            insertError.message
          );

          return;
        }

        clearFields();
        setIsExpanded(false);

        setSuccess(
          `"${trimmedTitle}" was created successfully.`
        );

        router.refresh();
      } catch (error) {
        console.error("Unexpected project creation error:", error);

        setError(
          "Something went wrong while saving your project. Please try again."
        );
      }
    });
  }

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
            aria-controls="create-project-panel"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:w-auto"
          >
            + New Project
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
          id="create-project-panel"
          aria-labelledby="create-project-heading"
          className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3
                id="create-project-heading"
                className="text-xl font-semibold tracking-tight text-black"
              >
                Create a project
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Give your work a place to live. You can
                add more details later.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelForm}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleCreateProject}
            className="space-y-5"
          >
            {/* Project title */}

            <div className="grid gap-2">
              <label
                htmlFor="project-title"
                className="text-sm font-semibold text-black"
              >
                Project title{" "}
                <span className="text-[#7b533e]">
                  *
                </span>
              </label>

              <input
                ref={titleInputRef}
                id="project-title"
                name="title"
                type="text"
                autoComplete="off"
                required
                maxLength={120}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="Spring brand shoot"
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? "project-form-error" : undefined
                }
                disabled={isPending}
                className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* Description */}

            <div className="grid gap-2">
              <label
                htmlFor="project-description"
                className="text-sm font-semibold text-black"
              >
                Description{" "}
                <span className="font-normal text-black/50">
                  (optional)
                </span>
              </label>

              <textarea
                id="project-description"
                name="description"
                rows={3}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="What are you working toward?"
                disabled={isPending}
                className="w-full resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* Due date and status */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="project-due-date"
                  className="text-sm font-semibold text-black"
                >
                  Due date{" "}
                  <span className="font-normal text-black/50">
                    (optional)
                  </span>
                </label>

                <input
                  id="project-due-date"
                  name="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  disabled={isPending}
                  className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="project-status"
                  className="text-sm font-semibold text-black"
                >
                  Status
                </label>

                <select
                  id="project-status"
                  name="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as ProjectStatus
                    )
                  }
                  disabled={isPending}
                  className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Error feedback */}

            {error && (
              <p
                id="project-form-error"
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            {/* Submit */}

            <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                {isPending
                  ? "Creating project..."
                  : "Create project"}
              </button>

              <p className="text-xs leading-5 text-black/50">
                Only the project title is required.
              </p>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}