// components/demo/DemoAction.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoAction({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "project" | "task";
}) {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const isProject = type === "project";

  const handleDemoSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(false);
    setShowPrompt(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:bg-black/5"
      >
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {isProject ? "Create project" : "Add task"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Demo mode lets you preview the flow. Sign up to save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-xl transition hover:bg-black/5"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleDemoSave}>
              {isProject ? <ProjectFields /> : <TaskFields />}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Save
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {showPrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-xl">
            <h3 className="text-xl font-semibold">Save your workspace</h3>

            <p className="mt-2 text-slate-600">
              Create a free account to keep your projects, tasks, and workspace settings.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/auth/sign-up"
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Create account →
              </Link>

              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="text-sm font-medium text-slate-500 transition hover:text-black"
              >
                Continue exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProjectFields() {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Project name
        </span>
        <input
          className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
          placeholder="Project name"
          defaultValue="New Brand Refresh"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </span>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
          placeholder="Project description"
          defaultValue="Refresh visual direction, organize assets, and plan launch tasks."
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </span>
        <select className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20">
          <option>Active</option>
          <option>Planning</option>
          <option>On hold</option>
        </select>
      </label>
    </>
  );
}

function TaskFields() {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Task title
        </span>
        <input
          className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
          placeholder="Task title"
          defaultValue="Review homepage layout"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Priority
        </span>
        <select className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20">
          <option>High priority</option>
          <option>Medium priority</option>
          <option>Low priority</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Due date
        </span>
        <input
          type="date"
          className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
        />
      </label>
    </>
  );
}