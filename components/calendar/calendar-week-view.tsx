// components/calendar/calendar-week-view.tsx

import type { CalendarEvent } from "@/components/calendar/calendar-view";

type CalendarWeekViewProps = {
  events: CalendarEvent[];
  currentDate: Date;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;

  d.setDate(diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function occursOnDate(event: CalendarEvent, date: Date) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return start <= dayEnd && end >= dayStart;
}

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

export default function CalendarWeekView({
  events,
  currentDate,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    return d;
  });

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {days.map((day) => {
        const dayEvents = events
          .filter((event) => occursOnDate(event, day))
          .sort(
            (a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
          );

        const isCurrentDay = sameDay(day, today);

        return (
          <section
            key={day.toISOString()}
            className={[
              "rounded-2xl border p-3",
              isCurrentDay
                ? "border-[#d7bfa8]/70 bg-[#fff7ed]"
                : "border-black/10 bg-[#fafaf7]",
            ].join(" ")}
          >
            <div className="mb-3 border-b border-black/5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.16em]",
                    isCurrentDay ? "text-[#7b533e]" : "text-black/45",
                  ].join(" ")}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </p>

                {isCurrentDay ? (
                  <span className="rounded-full bg-[#8f5f45] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    Today
                  </span>
                ) : null}
              </div>

              <p
                className={[
                  "mt-1 text-sm font-semibold",
                  isCurrentDay ? "text-[#3b2418]" : "text-black",
                ].join(" ")}
              >
                {day.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-2">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <article
                    key={`${event.id}-${day.toISOString()}`}
                    className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
                  >
                    <p className="text-sm font-semibold text-black">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-black/55">
                      {formatEventTime(event)}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-black/10 bg-white/60 p-3">
                  <p className="text-xs text-black/45">No events</p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}