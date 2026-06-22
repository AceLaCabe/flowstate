// app/(app)/settings/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import LogoutButton from "@/components/auth/logout-button";
import AccountSettingsForm from "@/components/settings/account-settings-form";

const settingSections = [
  {
    title: "Workspace preferences",
    description:
      "Customize workspace name, default views, project organization, and planning rhythm.",
    status: "Planned",
  },
  {
    title: "Group leader controls",
    description:
      "Manage group settings, permissions, member roles, and shared access rules.",
    status: "Planned",
  },
  {
    title: "Appearance",
    description:
      "Choose visual preferences like density, calm mode, color warmth, and reduced motion.",
    status: "Planned",
  },
  {
    title: "Notifications",
    description:
      "Control reminders for due dates, upcoming events, project updates, and team activity.",
    status: "Planned",
  },
];

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Profile load failed: ${profileError.message}`);
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (workspaceError) {
    throw new Error(`Workspace lookup failed: ${workspaceError.message}`);
  }

  if (!workspace) {
    redirect("/dashboard");
  }

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError) {
    throw new Error(`Member role load failed: ${memberError.message}`);
  }

  const firstName = profile?.first_name ?? "User";
  const lastName = profile?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const role = member?.role ?? "member";
  const isLeader = role === "owner" || role === "admin";

  return (
    <AppShell
      firstName={firstName}
      lastName={lastName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Account settings
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Customize how Flowstate works for you.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Update your account details, manage access, and prepare workspace
              preferences for future group controls.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Security note
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Email and password changes are handled through Supabase Auth.
                Some changes may require confirmation depending on your auth
                settings.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">
              Current account
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              {displayName}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              {workspace.name} · {role}
            </p>

            <div className="mt-5 rounded-2xl bg-white/60 p-4">
              <p className="text-sm font-semibold text-[#3b2418]">
                {isLeader ? "Group leader controls enabled" : "Member settings"}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#7b533e]">
                {isLeader
                  ? "This account can eventually manage workspace and group-level preferences."
                  : "This account can eventually customize personal preferences."}
              </p>
            </div>

            <div className="mt-5">
              <LogoutButton />
            </div>
          </div>
        </div>

        <AccountSettingsForm
          userId={user.id}
          userEmail={user.email ?? ""}
          initialFirstName={firstName}
          initialLastName={lastName}
        />

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-black/55">
              Settings categories
            </p>

            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
              Control center
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
              A structured place for workspace, group, preference, and
              notification controls.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {settingSections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold tracking-tight text-black">
                    {section.title}
                  </h4>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/55">
                    {section.status}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  {section.description}
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black opacity-60"
                >
                  Configure later
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}