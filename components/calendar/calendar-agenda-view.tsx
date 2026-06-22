// components/calendar/calendar-agenda-view.tsx

import type { CalendarEvent } from "@/components/calendar/calendar-view";

type CalendarAgendaViewProps = {
  events: CalendarEvent[];
  currentDate: Date;
};

function isAllDayEvent(event: CalendarEvent) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  return (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() === 59
  );
}

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(event: CalendarEvent) {
  if (isAllDayEvent(event)) return "All day";

  return `${new Date(event.start_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} – ${new Date(event.end_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    const key = new Date(event.start_time).toDateString();

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(event);

    return groups;
  }, {});
}

export default function CalendarAgendaView({
  events,
  currentDate: _currentDate,
}: CalendarAgendaViewProps) {
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const groupedEvents = groupEventsByDate(sortedEvents);

  const groupKeys = Object.keys(groupedEvents).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (sortedEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
        <p className="text-sm font-semibold text-black">No events scheduled</p>

        <p className="mt-1 text-sm leading-6 text-black/60">
          Create events to see them grouped into a calm agenda view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupKeys.map((key) => {
        const eventsForDay = groupedEvents[key];

        return (
          <section key={key} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                {formatEventDate(eventsForDay[0].start_time)}
              </h4>

              <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/55">
                {eventsForDay.length}
              </span>
            </div>

            <div className="space-y-3">
              {eventsForDay.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h5 className="text-base font-semibold text-black">
                        {event.title}
                      </h5>

                      <p className="mt-2 text-sm text-black/60">
                        {formatEventTime(event)}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/60">
                      Schedule
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}