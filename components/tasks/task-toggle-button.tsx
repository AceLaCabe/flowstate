// components/tasks/task-toggle-button.tsx

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TaskToggleButtonProps = {
  taskId: string;
  completed: boolean;
};

export default function TaskToggleButton({
  taskId,
  completed,
}: TaskToggleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const supabase = createClient();

    startTransition(async () => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", taskId);

      if (!error) {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={completed ? "Mark task as incomplete" : "Mark task as complete"}
      aria-pressed={completed}
      disabled={isPending}
      className={[
        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        completed
          ? "border-black bg-black text-white"
          : "border-black/20 bg-white text-transparent hover:bg-black/5",
        isPending ? "opacity-60" : "",
      ].join(" ")}
    >
      ✓
    </button>
  );
}