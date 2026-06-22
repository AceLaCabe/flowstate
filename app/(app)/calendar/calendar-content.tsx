// app/(app)/calendar/calendar-content.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateEventForm from "@/components/forms/create-event-form";
import EditEventForm from "@/components/calendar/edit-event-form";
import DeleteEventButton from "@/components/calendar/delete-event-button";
import CalendarView, {
  type CalendarEvent,
} from "@/components/calendar/calendar-view";

type EventSummary = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
};

function formatEventDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isToday(date: string) {
  const eventDate = new Date(date);
  const today = new Date();

  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

function isWithinNextSevenDays(date: string) {
  const eventDate = new Date(date).getTime();
  const now = new Date().getTime();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  return eventDate >= now && eventDate <= sevenDaysFromNow;
}

export default async function CalendarContent() {
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

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, start_time, end_time, created_at")
    .eq("workspace_id", workspace.id)
    .order("start_time", { ascending: true });

  if (eventsError) {
    throw new Error(`Events load failed: ${eventsError.message}`);
  }

  const normalizedEvents = (events ?? []) as EventSummary[];
  const calendarEvents = normalizedEvents as CalendarEvent[];

  const now = new Date().getTime();

  const upcomingEvents = normalizedEvents.filter(
    (event) => new Date(event.end_time).getTime() >= now
  );

  const pastEvents = normalizedEvents.filter(
    (event) => new Date(event.end_time).getTime() < now
  );

  const todayEvents = upcomingEvents.filter((event) =>
    isToday(event.start_time)
  );

  const weekEvents = upcomingEvents.filter((event) =>
    isWithinNextSevenDays(event.start_time)
  );

  const nextEvent = upcomingEvents[0] ?? null;

  const firstName = profile?.first_name ?? "User";

  return (
    <AppShell
      firstName={firstName}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <section className="space-y-8">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-black/55">
              Schedule management
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Calendar
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Keep track of meetings, sessions, deadlines, and important time
              blocks without crowding your workspace.
            </p>

            <div className="mt-6 rounded-2xl bg-[#fafaf7] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Next schedule signal
              </p>

              <p className="mt-2 text-sm leading-6 text-black/65">
                {nextEvent
                  ? `Your next event is “${nextEvent.title}” on ${formatEventDateTime(
                      nextEvent.start_time
                    )}.`
                  : "Nothing is scheduled yet. Add an event when your work needs a time block."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-[#fafaf7] px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Review tasks
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                View projects
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bfa8]/60 bg-[#fff7ed] p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#7b533e]">Quick add</p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#3b2418]">
              Add a time block
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#7b533e]">
              Use events for meetings, planning sessions, deadlines, and work
              blocks that need a place on the schedule.
            </p>

            <div className="mt-5">
              <CreateEventForm workspaceId={workspace.id} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CalendarMetric
            label="Today"
            value={todayEvents.length}
            description="Events on today’s schedule"
            warm={todayEvents.length > 0}
          />

          <CalendarMetric
            label="This week"
            value={weekEvents.length}
            description="Coming up soon"
          />

          <CalendarMetric
            label="Upcoming"
            value={upcomingEvents.length}
            description="Still ahead"
          />

          <CalendarMetric
            label="Past"
            value={pastEvents.length}
            description="Already ended"
          />
        </div>

        <CalendarView events={calendarEvents} />

        <div className="grid gap-6 xl:grid-cols-2">
          <EventColumn
            title="Upcoming"
            description="Events that are still ahead."
            count={upcomingEvents.length}
            emptyTitle="No upcoming events"
            emptyDescription="Create your first event to start mapping your schedule."
          >
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </EventColumn>

          <EventColumn
            title="Past events"
            description="Events that have already ended."
            count={pastEvents.length}
            emptyTitle="No past events yet"
            emptyDescription="Completed events will appear here over time."
          >
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </EventColumn>
        </div>
      </section>
    </AppShell>
  );
}

function CalendarMetric({
  label,
  value,
  description,
  warm = false,
}: {
  label: string;
  value: number;
  description: string;
  warm?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        warm
          ? "border-[#d7bfa8]/60 bg-[#fff7ed]"
          : "border-black/10 bg-white"
      }`}
    >
      <h3
        className={`text-sm font-medium ${
          warm ? "text-[#7b533e]" : "text-black/65"
        }`}
      >
        {label}
      </h3>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          warm ? "text-[#3b2418]" : "text-black"
        }`}
      >
        {value}
      </p>

      <p className={`mt-2 text-sm ${warm ? "text-[#7b533e]" : "text-black/55"}`}>
        {description}
      </p>
    </section>
  );
}

function EventColumn({
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
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-black">
            {title}
          </h3>

          <p className="mt-1 text-sm text-black/60">{description}</p>
        </div>

        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
          {count}
        </span>
      </div>

      {count > 0 ? (
        <div className="space-y-4">{children}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
          <p className="text-sm font-semibold text-black">{emptyTitle}</p>

          <p className="mt-1 text-sm leading-6 text-black/60">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

function EventCard({ event, past = false }: { event: EventSummary; past?: boolean }) {
  return (
    <article
      className={`rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${
        past ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-black">{event.title}</h4>

          <p className="mt-2 text-sm text-black/60">
            Starts: {formatEventDateTime(event.start_time)}
          </p>

          <p className="mt-1 text-sm text-black/55">
            Ends: {formatEventDateTime(event.end_time)}
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black/60">
          {past ? "Past" : "Upcoming"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4">
        <EditEventForm
          eventId={event.id}
          initialTitle={event.title}
          initialStartTime={event.start_time}
          initialEndTime={event.end_time}
        />

        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}