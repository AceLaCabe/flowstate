// components/tasks/edit-task-form.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProjectOption = {
  id: string;
  title: string;
};

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
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [priority, setPriority] = useState(initialPriority);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
    setDueDate(initialDueDate ?? "");
    setPriority(initialPriority);
    setProjectId(initialProjectId);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const supabase = createClient();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Please enter a task title.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: trimmedTitle,
          description: trimmedDescription || null,
          due_date: dueDate || null,
          priority,
          project_id: projectId,
        })
        .eq("id", taskId);

      if (error) {
        setError(error.message);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex w-fit items-center justify-center rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-4 rounded-xl border border-black/10 bg-white p-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-black">Task title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-black">
          Description <span className="text-black/45">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-black">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-black">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-black">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}