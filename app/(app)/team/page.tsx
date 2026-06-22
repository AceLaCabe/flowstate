// app/(app)/team/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

type MemberSummary = {
  id: string;
  user_id: string;
  role: string;
};

const groupTypes = [
  {
    title: "Workspace team",
    description:
      "Invite collaborators who need visibility across the whole workspace.",
  },
  {
    title: "Project group",
    description:
      "Create smaller groups around a specific project, launch, or initiative.",
  },
  {
    title: "Family or household",
    description:
      "Coordinate shared responsibilities, events, documents, and planning.",
  },
  {
    title: "Client review group",
    description:
      "Share selected project updates, assets, and tasks without exposing everything.",
  },
];

export default async function TeamPage() {
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

  const { data: members, error: membersError } = await supabase
    .from("workspace_members")
    .select("id, user_id, role")
    .eq("workspace_id", workspace.id);

  if (membersError) {
    throw new Error(`Members load failed: ${membersError.message}`);
  }

  const normalizedMembers = (members ?? []) as MemberSummary[];

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Team workspace
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Share work with the right people.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Create groups for teams, families, clients, or collaborators so
              project details, tasks, and files can be shared intentionally.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Collaboration model
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                Group tools are scaffolded here. Later, group leaders can invite
                members, assign roles, and control what each group can access.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">
              Current workspace
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              {workspace.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              {normalizedMembers.length} member
              {normalizedMembers.length === 1 ? "" : "s"} currently connected
              to this workspace.
            </p>

            <button
              type="button"
              disabled
              className="mt-5 inline-flex rounded-xl bg-[#3b2418] px-4 py-2 text-sm font-semibold text-white opacity-60"
            >
              Invite coming soon
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TeamMetric label="Members" value={normalizedMembers.length} />
          <TeamMetric label="Group types" value={groupTypes.length} />
          <TeamMetric label="Sharing level" value="Project" />
          <TeamMetric label="Leader tools" value="Planned" />
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-black/55">
              Group structures
            </p>

            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
              Flexible groups for work and life
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
              Flowstate can support professional teams, client spaces, family
              planning, and small-group coordination.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {groupTypes.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-black/10 bg-[#fafaf7] p-5"
              >
                <p className="text-lg font-semibold tracking-tight text-black">
                  {group.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  {group.description}
                </p>

                <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black/50">
                  Group creation coming soon
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">
                Workspace members
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                People with access
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                Member roles will determine who can view, edit, invite, and
                manage group-level settings.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {normalizedMembers.length} total
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {normalizedMembers.map((member) => (
              <article
                key={member.id}
                className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-black">
                      {member.user_id === user.id
                        ? `${profile?.first_name ?? "Current"} ${
                            profile?.last_name ?? "user"
                          }`
                        : "Workspace member"}
                    </p>

                    <p className="mt-1 text-sm text-black/55">
                      Member access profile
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-black/60">
                    {member.role}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function TeamMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/55">{label}</p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </section>
  );
}