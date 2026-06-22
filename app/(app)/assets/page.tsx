// app/(app)/assets/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const assetTypes = [
  {
    title: "Documents",
    description: "PDFs, Word docs, briefs, contracts, notes, and references.",
    formats: "PDF · DOC · DOCX",
  },
  {
    title: "Spreadsheets",
    description: "Budgets, trackers, timelines, inventories, and reports.",
    formats: "XLS · XLSX · CSV",
  },
  {
    title: "Presentations",
    description: "Pitch decks, client decks, strategy slides, and proposals.",
    formats: "PPT · PPTX",
  },
  {
    title: "Audio",
    description: "Voice notes, meeting recordings, interviews, and sound files.",
    formats: "MP3 · WAV · M4A",
  },
];

function getStatusLabel(status: string) {
  if (status === "on_hold") return "On hold";
  return status.replaceAll("_", " ");
}

export default async function AssetsPage() {
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

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, status, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Projects load failed: ${projectsError.message}`);
  }

  const normalizedProjects = (projects ?? []) as ProjectSummary[];

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">Asset library</p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Project files, all in one place.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Keep documents, spreadsheets, presentations, audio, and reference
              files attached to the projects that need them.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Asset system
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                This page is ready for Supabase Storage integration. For now, it
                gives the portfolio a clear view of how assets will be organized
                by project.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">Quick upload</p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              Add files to a project
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              Uploads are disabled in this scaffold until storage is connected.
            </p>

            <div className="mt-5 rounded-2xl border border-dashed border-[#d7bfa8] bg-white/60 p-5">
              <input
                type="file"
                multiple
                disabled
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.mp3,.wav,.m4a"
                className="block w-full text-sm text-[#7b533e] file:mr-4 file:rounded-xl file:border-0 file:bg-[#fff7ed] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#3b2418] disabled:opacity-60"
              />

              <button
                type="button"
                disabled
                className="mt-4 inline-flex rounded-xl bg-[#3b2418] px-4 py-2 text-sm font-semibold text-white opacity-60"
              >
                Upload coming soon
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AssetMetric label="Projects" value={normalizedProjects.length} />
          <AssetMetric label="File categories" value={assetTypes.length} />
          <AssetMetric label="Storage status" value="Ready" />
          <AssetMetric label="Access model" value="Project" />
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-black/55">
              Supported assets
            </p>

            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
              Files Flowstate can organize
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
              Assets are grouped by project so teams can keep source material,
              final files, and reference documents connected to the work.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {assetTypes.map((type) => (
              <article
                key={type.title}
                className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
              >
                <p className="text-base font-semibold text-black">
                  {type.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  {type.description}
                </p>

                <p className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/55">
                  {type.formats}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black/55">
                Project folders
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
                Asset homes
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                Each project can have its own file library for briefs,
                deliverables, audio, and supporting materials.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
              {normalizedProjects.length} folders
            </span>
          </div>

          {normalizedProjects.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {normalizedProjects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <p className="text-base font-semibold text-black">
                    {project.title}
                  </p>

                  <p className="mt-2 text-sm capitalize text-black/60">
                    {getStatusLabel(project.status)}
                  </p>

                  <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-white p-4">
                    <p className="text-sm font-semibold text-black">
                      No files yet
                    </p>

                    <p className="mt-1 text-sm leading-6 text-black/60">
                      Uploaded assets will appear here once storage is connected.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-6">
              <p className="text-sm font-semibold text-black">
                No project folders yet
              </p>

              <p className="mt-2 text-sm leading-6 text-black/60">
                Create a project before organizing files.
              </p>

              <Link
                href="/projects"
                className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black/5"
              >
                Go to projects
              </Link>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}

function AssetMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/55">{label}</p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </section>
  );
}