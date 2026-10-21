// app/(app)/settings/page.tsx

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

import LogoutButton from "@/components/auth/logout-button";
import AccountSettingsForm from "@/components/settings/account-settings-form";
import WorkspaceSettingsForm from "@/components/settings/workspace-settings-form";

const futureSettings = [
  {
    title: "Team permissions",
    description:
      "Manage invitations, member roles, and workspace access.",
  },
  {
    title: "Appearance",
    description:
      "Customize display preferences and visual comfort.",
  },
  {
    title: "Notifications",
    description:
      "Manage reminders for deadlines, events, and workspace activity.",
  },
];

export default async function SettingsPage() {
  const supabase = await createClient();

  /* --------------------------------------------------------
     AUTHENTICATION
  -------------------------------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /* --------------------------------------------------------
     PROFILE
  -------------------------------------------------------- */

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    throw new Error(
      `Profile load failed: ${profileError.message}`
    );
  }

  /* --------------------------------------------------------
     WORKSPACE
  -------------------------------------------------------- */

  const { data: workspace, error: workspaceError } =
    await supabase
      .from("workspaces")
      .select("id, name, owner_id")
      .eq("owner_id", user.id)
      .maybeSingle();

  if (workspaceError) {
    throw new Error(
      `Workspace lookup failed: ${workspaceError.message}`
    );
  }

  if (!workspace) {
    redirect("/dashboard");
  }

  /* --------------------------------------------------------
     MEMBERSHIP
  -------------------------------------------------------- */

  const { data: member, error: memberError } =
    await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspace.id)
      .eq("user_id", user.id)
      .maybeSingle();

  if (memberError) {
    throw new Error(
      `Member role load failed: ${memberError.message}`
    );
  }

  /* --------------------------------------------------------
     DISPLAY VALUES
  -------------------------------------------------------- */

  const firstName = profile?.first_name ?? "User";
  const lastName = profile?.last_name ?? "";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ");

  const isOwner = workspace.owner_id === user.id;

  const role = isOwner
    ? "owner"
    : member?.role ?? "member";

  /* ========================================================
     SETTINGS PAGE
  ======================================================== */

  return (
    <AppShell
      firstName={firstName}
      lastName={lastName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            PAGE INTRODUCTION
        ====================================== */}

        <header className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-black/55">
                Account and workspace
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Settings
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                Manage your personal account, security,
                and workspace details.
              </p>
            </div>

            <div className="rounded-2xl bg-[#fafaf7] px-4 py-3">
              <p className="text-sm font-semibold text-black">
                {displayName}
              </p>

              <p className="mt-1 text-xs capitalize text-black/55">
                {role} · {workspace.name}
              </p>
            </div>
          </div>
        </header>

        {/* ======================================
            ACCOUNT MANAGEMENT
        ====================================== */}

        <AccountSettingsForm
          userId={user.id}
          userEmail={user.email ?? ""}
          initialFirstName={firstName}
          initialLastName={lastName}
        />

        {/* ======================================
            WORKSPACE MANAGEMENT
        ====================================== */}

        {isOwner && (
          <WorkspaceSettingsForm
            workspaceId={workspace.id}
            initialName={workspace.name}
          />
        )}

        {/* ======================================
            ACCOUNT SECURITY
        ====================================== */}

        <section
          aria-labelledby="account-security-heading"
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-sm font-medium text-black/55">
            Account security
          </p>

          <h3
            id="account-security-heading"
            className="mt-1 text-xl font-semibold tracking-tight text-black sm:text-2xl"
          >
            Sign-in and session
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
            Email and password updates are handled by
            Supabase Auth. Some changes may require
            email confirmation.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
            <div>
              <p className="text-sm font-semibold text-black">
                Current session
              </p>

              <p className="mt-1 text-sm text-black/60">
                Sign out of your Flowstate account
                when you're finished.
              </p>
            </div>

            <LogoutButton />
          </div>
        </section>

        {/* ======================================
            FUTURE PREFERENCES
        ====================================== */}

        <section
          aria-labelledby="future-settings-heading"
          className="space-y-4"
        >
          <div>
            <h3
              id="future-settings-heading"
              className="text-lg font-semibold tracking-tight text-black"
            >
              Additional preferences
            </h3>

            <p className="mt-1 text-sm text-black/55">
              More workspace customization is planned
              for future releases.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {futureSettings.map((setting) => (
              <article
                key={setting.title}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="text-base font-semibold text-black">
                    {setting.title}
                  </h4>

                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/55">
                    Planned
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-black/60">
                  {setting.description}
                </p>
              </article>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}