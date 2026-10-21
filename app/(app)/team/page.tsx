// app/(app)/team/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

type MemberSummary = {
  id: string;
  user_id: string;
  role: string;
};

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function TeamPage() {
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
     PROFILE AND WORKSPACE
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
     WORKSPACE MEMBERS
  -------------------------------------------------------- */

  const { data: members, error: membersError } =
    await supabase
      .from("workspace_members")
      .select("id, user_id, role")
      .eq("workspace_id", workspace.id);

  if (membersError) {
    throw new Error(
      `Members load failed: ${membersError.message}`
    );
  }

  const normalizedMembers =
    (members ?? []) as MemberSummary[];

  const sortedMembers = [...normalizedMembers].sort(
    (a, b) => {
      if (a.user_id === workspace.owner_id) return -1;
      if (b.user_id === workspace.owner_id) return 1;

      return a.role.localeCompare(b.role);
    }
  );

  const firstName = profile?.first_name ?? "User";
  const lastName = profile?.last_name ?? "";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ");

  const isOwner = workspace.owner_id === user.id;

  const ownerIsListed = sortedMembers.some(
    (member) => member.user_id === workspace.owner_id
  );

  /* ========================================================
     TEAM PAGE
  ======================================================== */

  return (
    <AppShell
      firstName={firstName}
      lastName={lastName}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <header className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-black/55">
                {workspace.name}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Team
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                See who belongs to your workspace and
                review their access roles.
              </p>
            </div>

            <Link
              href="/settings"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-black/10 bg-[#fafaf7] px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Workspace settings
            </Link>
          </div>
        </header>

        {/* ======================================
            WORKSPACE SUMMARY
        ====================================== */}

        <section className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-[#7b533e]">
            Current workspace
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-[#3b2418]">
                {workspace.name}
              </h3>

              <p className="mt-2 text-sm text-[#7b533e]">
                {sortedMembers.length} registered{" "}
                {sortedMembers.length === 1
                  ? "member"
                  : "members"}
              </p>
            </div>

            <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#7b533e]">
              {isOwner ? "Workspace owner" : "Member"}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7b533e]">
            Membership records identify who belongs to this
            workspace. Invitations and permissions management
            will become available when shared workspace access
            is configured.
          </p>
        </section>

        {/* ======================================
            MEMBER DIRECTORY
        ====================================== */}

        <section
          aria-labelledby="team-members-heading"
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-black/55">
                Workspace members
              </p>

              <h3
                id="team-members-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-black"
              >
                People with access
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/60">
                Current membership records and assigned roles.
              </p>
            </div>

            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/65">
              {sortedMembers.length} total
            </span>
          </div>

          {sortedMembers.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedMembers.map((member) => {
                const isCurrentUser =
                  member.user_id === user.id;

                const isWorkspaceOwner =
                  member.user_id === workspace.owner_id;

                return (
                  <article
                    key={member.id}
                    className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                          {isCurrentUser
                            ? firstName.charAt(0).toUpperCase()
                            : "M"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-black">
                            {isCurrentUser
                              ? displayName
                              : "Workspace member"}
                          </p>

                          <p className="mt-1 text-sm text-black/55">
                            {isCurrentUser
                              ? "You"
                              : "Registered member"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/65">
                        {isWorkspaceOwner
                          ? "Owner"
                          : formatRole(member.role)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
              <p className="text-sm font-semibold text-black">
                No membership records found
              </p>

              <p className="mt-2 text-sm leading-6 text-black/60">
                This workspace has no visible member records.
                The owner membership may need to be checked
                before collaboration is enabled.
              </p>
            </div>
          )}

          {!ownerIsListed && sortedMembers.length > 0 && (
            <p className="mt-5 rounded-xl bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#7b533e]">
              The workspace owner does not appear in the
              membership results. Verify the owner membership
              before enabling invitations.
            </p>
          )}
        </section>

        {/* ======================================
            COLLABORATION STATUS
        ====================================== */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-black/55">
            Collaboration
          </p>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-black">
            Shared workspace access
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
            Invitations, member management, and project-specific
            permissions are not enabled yet. These features
            require verified database access policies and
            member-aware workspace navigation.
          </p>

          <div className="mt-5 rounded-2xl border border-black/10 bg-[#fafaf7] p-4">
            <p className="text-sm font-semibold text-black">
              Next development milestone
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Allow authorized members to open shared
              workspaces, then implement invitations and
              permission management.
            </p>
          </div>
        </section>

      </div>
    </AppShell>
  );
}