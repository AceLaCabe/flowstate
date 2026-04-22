// components/forms/create-task-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProjectOption = {
  id: string;
  title: string;
};

type CreateTaskFormProps = {
  projects: ProjectOption[];
};

export default function CreateTaskForm({ projects }: CreateTaskFormProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setProjectId(projects[0]?.id ?? "");
    setDueDate("");
    setPriority("medium");
    setError(null);
    setIsExpanded(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
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

    if (!projectId) {
      setError("Please select a project first.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.from("tasks").insert({
        title: trimmedTitle,
        description: trimmedDescription || null,
        project_id: projectId,
        due_date: dueDate || null,
        priority,
      });

      if (error) {
        setError(error.message);
        return;
      }

      resetForm();
      router.refresh();
    });
  };

  if (!projects.length) {
    return (
      <section className="rounded-2xl border border-dashed border-black/15 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Create a project first</h3>
        <p className="mt-2 text-sm leading-6 text-black/65">
          Tasks need a project home. Add a project before creating tasks.
        </p>
      </section>
    );
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-5 py-4 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:w-auto"
      >
        + New Task
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-black">Create Task</h3>
          <p className="mt-1 text-sm text-black/65">
            Add a new task to one of your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex w-fit items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleCreateTask} className="space-y-5">
        <div className="grid gap-2">
          <label htmlFor="task-title" className="text-sm font-medium text-black">
            Task title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft homepage copy"
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30 focus:ring-2 focus:ring-black/10"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="task-description" className="text-sm font-medium text-black">
            Description <span className="text-black/45">(optional)</span>
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes, context, or details for this task."
            rows={3}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30 focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2 sm:col-span-1">
            <label htmlFor="task-project" className="text-sm font-medium text-black">
              Project
            </label>
            <select
              id="task-project"
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
            <label htmlFor="task-due-date" className="text-sm font-medium text-black">
              Due date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="task-priority" className="text-sm font-medium text-black">
              Priority
            </label>
            <select
              id="task-priority"
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
            {isPending ? "Creating task..." : "Create Task"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}