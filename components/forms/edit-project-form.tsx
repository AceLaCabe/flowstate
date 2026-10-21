// components/projects/edit-project-form.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProjectStatus = "active" | "on_hold" | "completed";

type EditProjectFormProps = {
  projectId: string;
  workspaceId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialDueDate: string | null;
  initialStatus: string;
};

export default function EditProjectForm({
  projectId,
  workspaceId,
  initialTitle,
  initialDescription,
  initialDueDate,
  initialStatus,
}: EditProjectFormProps) {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(
    initialDescription ?? ""
  );
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    initialStatus as ProjectStatus
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      titleRef.current?.focus();
    }
  }, [isEditing]);

  function resetFields() {
    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
    setDueDate(initialDueDate ?? "");
    setStatus(initialStatus as ProjectStatus);
    setError(null);
  }

  function openEditor() {
    resetFields();
    setSuccess(null);
    setIsEditing(true);
  }

  function cancelEditor() {
    if (isSaving) return;

    resetFields();
    setIsEditing(false);

    requestAnimationFrame(() => {
      editButtonRef.current?.focus();
    });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setError(null);
    setSuccess(null);

    if (!trimmedTitle) {
      setError("Enter a project title to continue.");
      titleRef.current?.focus();
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from("projects")
        .update({
          title: trimmedTitle,
          description: trimmedDescription || null,
          due_date: dueDate || null,
          status,
        })
        .eq("id", projectId)
.eq("workspace_id", workspaceId)
.select("id")
        .single();

      if (updateError || !data) {
        console.error("Project update failed:", updateError);

        setError(
          "The project couldn't be updated. Please try again."
        );
        return;
      }

      setSuccess("Project changes saved.");
      setIsEditing(false);
      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Unexpected project update error:",
        unexpectedError
      );

      setError(
        "Something went wrong while saving. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      {!isEditing ? (
        <>
          <button
            ref={editButtonRef}
            type="button"
            onClick={openEditor}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Edit project
          </button>

          {success && (
            <p
              role="status"
              className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {success}
            </p>
          )}
        </>
      ) : (
        <form
          onSubmit={handleSave}
          aria-labelledby="edit-project-heading"
          className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <h3
              id="edit-project-heading"
              className="text-xl font-semibold tracking-tight text-black"
            >
              Edit project
            </h3>

            <p className="mt-2 text-sm text-black/60">
              Update your project's details and progress.
            </p>
          </div>

          {/* Title */}

          <div className="grid gap-2">
            <label
              htmlFor="edit-project-title"
              className="text-sm font-semibold text-black"
            >
              Project title *
            </label>

            <input
              ref={titleRef}
              id="edit-project-title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError(null);
              }}
              disabled={isSaving}
              className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
            />
          </div>

          {/* Description */}

          <div className="grid gap-2">
            <label
              htmlFor="edit-project-description"
              className="text-sm font-semibold text-black"
            >
              Description{" "}
              <span className="font-normal text-black/50">
                (optional)
              </span>
            </label>

            <textarea
              id="edit-project-description"
              rows={3}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={isSaving}
              className="w-full resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
            />
          </div>

          {/* Due date and status */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="edit-project-due-date"
                className="text-sm font-semibold text-black"
              >
                Due date{" "}
                <span className="font-normal text-black/50">
                  (optional)
                </span>
              </label>

              <input
                id="edit-project-due-date"
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
                htmlFor="edit-project-status"
                className="text-sm font-semibold text-black"
              >
                Status
              </label>

              <select
                id="edit-project-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProjectStatus)
                }
                disabled={isSaving}
                className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              >
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 border-t border-black/10 pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={cancelEditor}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}