// app/(app)/calendar/calendar-content.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";
import CreateEventForm from "@/components/forms/create-event-form";
import EditEventForm from "@/components/calendar/edit-event-form";
import DeleteEventButton from "@/components/calendar/delete-event-button";
import CalendarView, {
  type CalendarEvent,
} from "@/components/calendar/calendar-view";

function formatEventDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type EventTypeOption = {
  id: string;
  name: string;
  color: string;
};

type EventSummary = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  event_type_id: string | null;
};

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
    .single();

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

  const { data: eventTypes, error: eventTypesError } = await supabase
    .from("event_types")
    .select("id, name, color")
    .eq("workspace_id", workspace.id)
    .order("name", { ascending: true });

  if (eventTypesError) {
    throw new Error(`Event types load failed: ${eventTypesError.message}`);
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, start_time, end_time, created_at, event_type_id")
    .eq("workspace_id", workspace.id)
    .order("start_time", { ascending: true });

  if (eventsError) {
    throw new Error(`Events load failed: ${eventsError.message}`);
  }

  const normalizedEventTypes = (eventTypes ?? []) as EventTypeOption[];
  const normalizedEvents = (events ?? []) as EventSummary[];
  const calendarEvents = normalizedEvents as CalendarEvent[];
  const now = new Date().getTime();

  const upcomingEvents = normalizedEvents.filter(
    (event) => new Date(event.end_time).getTime() >= now
  );

  const pastEvents = normalizedEvents.filter(
    (event) => new Date(event.end_time).getTime() < now
  );

  return (
    <AppShell
      firstName={profile?.first_name ?? "User"}
      lastName={profile?.last_name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-black/65">Schedule management</p>
        <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Calendar
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
          Keep track of meetings, sessions, deadlines, and important time blocks.
        </p>
      </div>

      <div className="mb-8">
        <CreateEventForm
          workspaceId={workspace.id}
          eventTypes={normalizedEventTypes}
        />
      </div>

      <div className="mb-8">
        <CalendarView events={calendarEvents} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Upcoming</h3>
              <p className="mt-1 text-sm text-black/60">
                Events that are still ahead.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {upcomingEvents.length}
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4"
                >
                  <h4 className="text-base font-semibold text-black">
                    {event.title}
                  </h4>
                  <p className="mt-2 text-sm text-black/60">
                    Starts: {formatEventDateTime(event.start_time)}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    Ends: {formatEventDateTime(event.end_time)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <EditEventForm
                      eventId={event.id}
                      initialTitle={event.title}
                      initialStartTime={event.start_time}
                      initialEndTime={event.end_time}
                      initialEventTypeId={event.event_type_id}
                      eventTypes={normalizedEventTypes}
                    />
                    <DeleteEventButton eventId={event.id} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">No upcoming events</p>
              <p className="mt-1 text-sm text-black/60">
                Create your first event to start mapping your schedule.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black">Past Events</h3>
              <p className="mt-1 text-sm text-black/60">
                Events that have already ended.
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
              {pastEvents.length}
            </span>
          </div>

          {pastEvents.length > 0 ? (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-black/10 bg-[#fafaf7] p-4 opacity-80"
                >
                  <h4 className="text-base font-semibold text-black">
                    {event.title}
                  </h4>
                  <p className="mt-2 text-sm text-black/60">
                    Started: {formatEventDateTime(event.start_time)}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    Ended: {formatEventDateTime(event.end_time)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <EditEventForm
                      eventId={event.id}
                      initialTitle={event.title}
                      initialStartTime={event.start_time}
                      initialEndTime={event.end_time}
                      initialEventTypeId={event.event_type_id}
                      eventTypes={normalizedEventTypes}
                    />
                    <DeleteEventButton eventId={event.id} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
              <p className="text-sm font-medium text-black">No past events yet</p>
              <p className="mt-1 text-sm text-black/60">
                Completed events will appear here over time.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}