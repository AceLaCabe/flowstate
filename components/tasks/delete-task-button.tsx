// components/tasks/delete-task-button.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeleteTaskButtonProps = {
  taskId: string;
};

export default function DeleteTaskButton({
  taskId,
}: DeleteTaskButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (isDeleting) return;

    const confirmed = window.confirm(
      "Delete this task? This action cannot be undone."
    );

    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    try {
      const supabase = createClient();

      const { data, error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .select("id");

      if (deleteError) {
        console.error("Task deletion failed:", deleteError.message);

        setError("Couldn't delete this task. Please try again.");
        return;
      }

      if (!data?.length) {
        setError(
          "The task wasn't deleted. It may no longer exist or you may not have permission."
        );
        return;
      }

      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Unexpected task deletion error:",
        unexpectedError
      );

      setError(
        "Something went wrong while deleting the task."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex w-fit items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p
          role="alert"
          className="max-w-xs text-xs leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}