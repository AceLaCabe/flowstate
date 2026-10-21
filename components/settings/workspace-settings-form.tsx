// components/settings/workspace-settings-form.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type WorkspaceSettingsFormProps = {
  workspaceId: string;
  initialName: string;
};

export default function WorkspaceSettingsForm({
  workspaceId,
  initialName,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) return;

    const trimmedName = name.trim();

    setError(null);
    setSuccess(null);

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Workspace name must be 100 characters or less.");
      return;
    }

    if (trimmedName === initialName) {
      setSuccess("No changes to save.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const { data, error: updateError } = await supabase
        .from("workspaces")
        .update({ name: trimmedName })
        .eq("id", workspaceId)
        .eq("owner_id", user.id)
        .select("id, name")
        .maybeSingle();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (!data) {
        setError(
          "Workspace could not be updated. Check that you have permission to edit it."
        );
        return;
      }

      setName(data.name);
      setSuccess("Workspace name updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      aria-labelledby="workspace-settings-heading"
      className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <p className="text-sm font-medium text-black/55">
          Workspace preferences
        </p>

        <h3
          id="workspace-settings-heading"
          className="mt-1 text-2xl font-semibold tracking-tight text-black"
        >
          Workspace details
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
          Change the name displayed throughout your workspace.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
      >
        <div className="max-w-xl space-y-2">
          <label
            htmlFor="workspace-name"
            className="text-sm font-medium text-black"
          >
            Workspace name
          </label>

          <input
            id="workspace-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="My workspace"
            disabled={isSaving}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
          />

          <p className="text-xs leading-5 text-black/50">
            This updates the workspace name, not your personal profile.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save workspace"}
        </button>
      </form>
    </section>
  );
}