// components/tasks/edit-task-form.tsx

"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProjectOption = {
  id: string;
  title: string;
};

type TaskPriority = "low" | "medium" | "high";

type EditTaskFormProps = {
  taskId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialDueDate: string | null;
  initialPriority: string;
  initialProjectId: string;
  projects: ProjectOption[];
};

export default function EditTaskForm({
  taskId,
  initialTitle,
  initialDescription,
  initialDueDate,
  initialPriority,
  initialProjectId,
  projects,
}: EditTaskFormProps) {
  const router = useRouter();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(
    initialDescription ?? ""
  );
  const [dueDate, setDueDate] = useState(
    initialDueDate ?? ""
  );
  const [priority, setPriority] = useState(
    initialPriority
  );
  const [projectId, setProjectId] = useState(
    initialProjectId
  );

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* ========================================================
     DIALOG CONTROLS
  ======================================================== */

  function resetFields() {
    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
    setDueDate(initialDueDate ?? "");
    setPriority(initialPriority);
    setProjectId(initialProjectId);
    setError(null);
  }

  function openDialog() {
    resetFields();

    dialogRef.current?.showModal();
    titleRef.current?.focus();
  }

  function closeDialog() {
    if (savingRef.current) return;

    dialogRef.current?.close();
  }

  function handleDialogClose() {
    setError(null);
    triggerRef.current?.focus();
  }

  /* ========================================================
     SAVE TASK
  ======================================================== */

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (savingRef.current) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setError(null);

    if (!trimmedTitle) {
      setError("Enter a task title to continue.");
      titleRef.current?.focus();
      return;
    }

    if (
      !projectId ||
      !projects.some(
        (project) => project.id === projectId
      )
    ) {
      setError("Select a valid project.");
      return;
    }

    savingRef.current = true;
    setIsSaving(true);

    try {
      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from("tasks")
        .update({
          title: trimmedTitle,
          description: trimmedDescription || null,
          due_date: dueDate || null,
          priority,
          project_id: projectId,
        })
        .eq("id", taskId)
        .select("id");

      if (updateError) {
        console.error(
          "Task update failed:",
          updateError.message
        );

        setError(
          "Your changes couldn't be saved. Please try again."
        );
        return;
      }

      if (!data?.length) {
        setError(
          "The task wasn't updated. It may no longer exist or you may not have permission."
        );
        return;
      }

      dialogRef.current?.close();

      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Unexpected task update error:",
        unexpectedError
      );

      setError(
        "Something went wrong while saving your task. Please try again."
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  /* ========================================================
     INTERFACE
  ======================================================== */

  return (
    <>
      {/* EDIT TRIGGER */}

      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        Edit
      </button>

      {/* MODAL DIALOG */}

      <dialog
        ref={dialogRef}
        aria-labelledby={`edit-task-heading-${taskId}`}
        aria-describedby={`edit-task-description-${taskId}`}
        onClose={handleDialogClose}
        onCancel={(event) => {
          if (savingRef.current) {
            event.preventDefault();
          }
        }}
        className="fixed inset-0 m-auto max-h-[min(90dvh,820px)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[1.75rem] border border-black/10 bg-white p-0 text-black shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-5 sm:p-7">

          {/* HEADER */}

          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-black/50">
                Task details
              </p>

              <h2
                id={`edit-task-heading-${taskId}`}
                className="mt-1 text-2xl font-semibold tracking-tight text-black"
              >
                Edit task
              </h2>

              <p
                id={`edit-task-description-${taskId}`}
                className="mt-2 text-sm leading-6 text-black/60"
              >
                Make changes to this task and save
                when you're ready.
              </p>
            </div>

            <button
              type="button"
              onClick={closeDialog}
              disabled={isSaving}
              aria-label="Close task editor"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-xl text-black/60 transition hover:bg-black/5 hover:text-black disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* EDIT FORM */}

          <form
            onSubmit={handleSave}
            className="space-y-5"
          >
            {/* TITLE */}

            <div className="grid gap-2">
              <label
                htmlFor={`edit-task-title-${taskId}`}
                className="text-sm font-semibold text-black"
              >
                Task title{" "}
                <span className="text-[#7b533e]">*</span>
              </label>

              <input
                ref={titleRef}
                id={`edit-task-title-${taskId}`}
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
                disabled={isSaving}
                className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="grid gap-2">
              <label
                htmlFor={`edit-task-notes-${taskId}`}
                className="text-sm font-semibold text-black"
              >
                Description{" "}
                <span className="font-normal text-black/50">
                  (optional)
                </span>
              </label>

              <textarea
                id={`edit-task-notes-${taskId}`}
                name="description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                disabled={isSaving}
                placeholder="Add context or details..."
                className="w-full resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </div>

            {/* PROJECT */}

            <div className="grid gap-2">
              <label
                htmlFor={`edit-task-project-${taskId}`}
                className="text-sm font-semibold text-black"
              >
                Project
              </label>

              <select
                id={`edit-task-project-${taskId}`}
                name="project_id"
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  setError(null);
                }}
                disabled={isSaving}
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
            </div>

            {/* DUE DATE AND PRIORITY */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor={`edit-task-date-${taskId}`}
                  className="text-sm font-semibold text-black"
                >
                  Due date{" "}
                  <span className="font-normal text-black/50">
                    (optional)
                  </span>
                </label>

                <input
                  id={`edit-task-date-${taskId}`}
                  name="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  disabled={isSaving}
                  className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor={`edit-task-priority-${taskId}`}
                  className="text-sm font-semibold text-black"
                >
                  Priority
                </label>

                <select
                  id={`edit-task-priority-${taskId}`}
                  name="priority"
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value);
                    setError(null);
                  }}
                  disabled={isSaving}
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
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {error}
              </p>
            )}

            {/* FOOTER ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                {isSaving
                  ? "Saving changes..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}