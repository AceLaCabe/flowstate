// components/projects/delete-project-button.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeleteProjectButtonProps = {
  projectId: string;
  workspaceId: string;
  projectTitle: string;
  taskCount: number;
};

export default function DeleteProjectButton({
  projectId,
  workspaceId,
  projectTitle,
  taskCount,
}: DeleteProjectButtonProps) {
  const router = useRouter();

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmation.trim() === projectTitle;

  function closeConfirmation() {
    if (isDeleting) return;

    setIsConfirming(false);
    setConfirmation("");
    setError(null);
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDeleting || !isConfirmed) return;

    setError(null);
    setIsDeleting(true);

    try {
      const supabase = createClient();

      const { data, error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("workspace_id", workspaceId)
        .select("id");

      if (deleteError) {
        console.error(
          "Project deletion failed:",
          deleteError.message
        );

        setError(
          "The project couldn't be deleted. Please try again."
        );
        return;
      }

      if (!data?.length) {
        setError(
          "The project wasn't deleted. It may no longer exist or you may not have permission."
        );
        return;
      }

      router.replace("/projects");
      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Unexpected project deletion error:",
        unexpectedError
      );

      setError(
        "Something went wrong while deleting the project."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      aria-labelledby="delete-project-title"
      className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6"
    >
      <div>
        <h3
          id="delete-project-title"
          className="text-lg font-semibold text-black"
        >
          Delete project
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
          Permanently remove this project and all its
          associated tasks.
        </p>
      </div>

      {!isConfirming ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsConfirming(true);
          }}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          Delete project
        </button>
      ) : (
        <form
          onSubmit={handleDelete}
          className="mt-5 space-y-5 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5"
        >
          <div>
            <h4 className="font-semibold text-red-900">
              Are you sure?
            </h4>

            <p className="mt-2 text-sm leading-6 text-red-900/80">
              Deleting{" "}
              <strong className="break-words">
                {projectTitle}
              </strong>{" "}
              will also permanently delete{" "}
              <strong>
                {taskCount} associated{" "}
                {taskCount === 1 ? "task" : "tasks"}
              </strong>
              .
            </p>

            <p className="mt-2 text-sm font-semibold text-red-900">
              This action cannot be undone.
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="confirm-project-deletion"
              className="text-sm font-medium text-red-900"
            >
              Type{" "}
              <strong className="break-all">
                {projectTitle}
              </strong>{" "}
              to confirm
            </label>

            <input
              id="confirm-project-deletion"
              type="text"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError(null);
              }}
              disabled={isDeleting}
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter the project name"
              className="min-h-12 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-base text-black outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 disabled:opacity-60"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-red-800"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              {isDeleting
                ? "Deleting project..."
                : "Permanently delete"}
            </button>

            <button
              type="button"
              onClick={closeConfirmation}
              disabled={isDeleting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}