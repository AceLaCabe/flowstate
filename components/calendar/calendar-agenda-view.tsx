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

function formatEventDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CalendarAgendaView({
  events,
}: CalendarAgendaViewProps) {
  const sortedEvents = [...events].sort((a, b) => {
    return (
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  });

  return (
    <div className="space-y-4">
      {sortedEvents.length > 0 ? (
        sortedEvents.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4"
          >
            <h4 className="text-base font-semibold text-black">{event.title}</h4>
            <p className="mt-2 text-sm text-black/60">
              {isAllDayEvent(event)
                ? `${new Date(event.start_time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} • All day`
                : `Starts: ${formatEventDateTime(event.start_time)}`}
            </p>
            <p className="mt-1 text-sm text-black/55">
              {isAllDayEvent(event)
                ? `Ends: ${new Date(event.end_time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : `Ends: ${formatEventDateTime(event.end_time)}`}
            </p>
          </article>
        ))
      ) : (
        <div className="rounded-xl border border-dashed border-black/15 bg-[#fafaf7] p-4">
          <p className="text-sm font-medium text-black">No events scheduled</p>
          <p className="mt-1 text-sm text-black/60">
            Create events to see them in your agenda.
          </p>
        </div>
      )}
    </div>
  );
}