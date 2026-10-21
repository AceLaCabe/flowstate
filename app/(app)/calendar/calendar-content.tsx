// app/(app)/calendar/calendar-content.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

import CreateEventForm from "@/components/forms/create-event-form";

import CalendarView from "@/components/calendar/calendar-view";
import CalendarOverview from "@/components/calendar/calendar-overview";
import EventCard from "@/components/calendar/event-card";

import type { CalendarEntry } from "@/components/calendar/calendar-types";

/* ==========================================================
   TYPES
========================================================== */

type EventSummary = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
};

type ProjectDeadline = {
  id: string;
  title: string;
  due_date: string | null;
};

type TaskDeadline = {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  project_id: string;
};

/* ==========================================================
   CALENDAR CONTENT
========================================================== */

export default async function CalendarContent() {
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
      .select("id, name")
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
     WORKSPACE CALENDAR DATA
  -------------------------------------------------------- */

  const [
    { data: events, error: eventsError },
    { data: projects, error: projectsError },
    { data: tasks, error: tasksError },
  ] = await Promise.all([
    // Scheduled events
    supabase
      .from("events")
      .select(
        "id, title, start_time, end_time, created_at"
      )
      .eq("workspace_id", workspace.id)
      .order("start_time", { ascending: true }),

    // Project deadlines
    supabase
      .from("projects")
      .select("id, title, due_date")
      .eq("workspace_id", workspace.id)
      .not("due_date", "is", null),

    // Task deadlines belonging to workspace projects
    supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        due_date,
        completed,
        project_id,
        projects!inner (
          id,
          workspace_id
        )
        `
      )
      .eq("projects.workspace_id", workspace.id)
      .not("due_date", "is", null),
  ]);

  /* --------------------------------------------------------
     QUERY ERRORS
  -------------------------------------------------------- */

  if (eventsError) {
    throw new Error(
      `Events load failed: ${eventsError.message}`
    );
  }

  if (projectsError) {
    throw new Error(
      `Project deadlines failed to load: ${projectsError.message}`
    );
  }

  if (tasksError) {
    throw new Error(
      `Task deadlines failed to load: ${tasksError.message}`
    );
  }

  /* --------------------------------------------------------
     NORMALIZE DATABASE RESULTS
  -------------------------------------------------------- */

  const normalizedEvents =
    (events ?? []) as EventSummary[];

  const normalizedProjects =
    (projects ?? []) as ProjectDeadline[];

  const normalizedTasks =
    (tasks ?? []) as TaskDeadline[];

  /* --------------------------------------------------------
     UNIFIED CALENDAR ENTRIES

     Scheduled events use timestamps.
     Task and project deadlines use YYYY-MM-DD strings.

     Date-only deadlines must not be converted to UTC.
  -------------------------------------------------------- */

  const calendarEntries: CalendarEntry[] = [
    // Scheduled events
    ...normalizedEvents.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      kind: "event" as const,
      start_time: event.start_time,
      end_time: event.end_time,
    })),

    // Task deadlines
    ...normalizedTasks
      .filter(
        (
          task
        ): task is TaskDeadline & {
          due_date: string;
        } => task.due_date !== null
      )
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        kind: "task" as const,
        start_time: task.due_date,
        end_time: task.due_date,
        href: "/tasks",
        allDay: true,
        completed: task.completed,
      })),

    // Project deadlines
    ...normalizedProjects
      .filter(
        (
          project
        ): project is ProjectDeadline & {
          due_date: string;
        } => project.due_date !== null
      )
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.title,
        kind: "project" as const,
        start_time: project.due_date,
        end_time: project.due_date,
        href: `/projects/${project.id}`,
        allDay: true,
      })),
  ];

  /* --------------------------------------------------------
     EVENT LISTS

     Classification uses absolute timestamps, not server
     calendar dates, so time-zone conversion isn't needed.
  -------------------------------------------------------- */

  const nowMs = Date.now();

  const upcomingEvents = normalizedEvents.filter(
    (event) =>
      new Date(event.end_time).getTime() >= nowMs
  );

  const pastEvents = normalizedEvents
    .filter(
      (event) =>
        new Date(event.end_time).getTime() < nowMs
    )
    .reverse();

  /* ========================================================
     PAGE
  ======================================================== */

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="space-y-6">

        {/* ======================================
            01. PAGE INTRODUCTION
        ====================================== */}

        <header className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-black/55">
                {workspace.name}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Calendar
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                See your scheduled events, project deadlines,
                and task due dates together in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/tasks"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-[#fafaf7] px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Review tasks
              </Link>

              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                View projects
              </Link>
            </div>
          </div>
        </header>

        {/* ======================================
            02. EVENT CREATION
        ====================================== */}

        <section
          aria-labelledby="calendar-create-heading"
          className="rounded-[2rem] border border-[#d7bfa8]/70 bg-[#fff7ed] p-5 shadow-sm sm:p-6"
        >
          <p className="text-sm font-medium text-[#7b533e]">
            Schedule something
          </p>

          <h3
            id="calendar-create-heading"
            className="mt-1 text-xl font-semibold tracking-tight text-[#3b2418] sm:text-2xl"
          >
            Add a time block
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b533e]">
            Set aside time for meetings, planning,
            focused work, or anything else that
            needs a place on your schedule.
          </p>

          <div className="mt-5">
            <CreateEventForm workspaceId={workspace.id} />
          </div>
        </section>

        {/* ======================================
            03. UNIFIED CALENDAR
        ====================================== */}

        <CalendarView entries={calendarEntries} />

        {/* ======================================
            04. EVENT LISTS
        ====================================== */}

        <section
          aria-labelledby="calendar-events-heading"
          className="space-y-5"
        >
          <div>
            <h3
              id="calendar-events-heading"
              className="text-xl font-semibold tracking-tight text-black sm:text-2xl"
            >
              Your schedule
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Review upcoming commitments or revisit
              previous events.
            </p>
          </div>

          <div className="space-y-5">

            {/* UPCOMING EVENTS */}

            <EventSection
              title="Upcoming events"
              description="Events that are still ahead or in progress."
              count={upcomingEvents.length}
              emptyTitle="Nothing scheduled yet"
              emptyDescription="Add an event whenever your work needs a dedicated time block."
            >
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </EventSection>

            {/* PAST EVENTS */}

            {pastEvents.length > 0 && (
              <details className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black [&::-webkit-details-marker]:hidden">
                  <div>
                    <h4 className="text-base font-semibold text-black">
                      Past events
                    </h4>

                    <p className="mt-1 text-sm text-black/55">
                      Previously scheduled time blocks.
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-black/65">
                    {pastEvents.length}

                    <span
                      aria-hidden="true"
                      className="transition-transform group-open:rotate-180"
                    >
                      ↓
                    </span>
                  </span>
                </summary>

                <div className="border-t border-black/10 p-4 sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        past
                      />
                    ))}
                  </div>
                </div>
              </details>
            )}
          </div>
        </section>

        {/* ======================================
            05. UNIFIED SCHEDULE OVERVIEW
        ====================================== */}

        <CalendarOverview entries={calendarEntries} />

      </div>
    </AppShell>
  );
}

/* ==========================================================
   EVENT SECTION
========================================================== */

function EventSection({
  title,
  description,
  count,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  description: string;
  count: number;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xl font-semibold tracking-tight text-black">
            {title}
          </h4>

          <p className="mt-1 text-sm text-black/60">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
          {count}
        </span>
      </div>

      {count > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {children}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
          <p className="text-sm font-semibold text-black">
            {emptyTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-black/60">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}