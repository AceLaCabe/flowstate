// components/calendar/calendar-month-view.tsx

import type { CalendarEvent } from "@/components/calendar/calendar-view";

type CalendarMonthViewProps = {
  events: CalendarEvent[];
  currentDate: Date;
};

function startOfMonthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - day);
  gridStart.setHours(0, 0, 0, 0);
  return gridStart;
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

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonthView({
  events,
  currentDate,
}: CalendarMonthViewProps) {
  const gridStart = startOfMonthGrid(currentDate);
  const today = new Date();

  const days = Array.from({ length: 42 }, (_, index) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + index);
    return d;
  });

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-black/45"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const inCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayEvents = events.filter((event) => occursOnDate(event, day));
          const isToday = sameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={[
                "min-h-[120px] rounded-2xl border p-2",
                inCurrentMonth
                  ? "border-black/10 bg-[#fafaf7]"
                  : "border-black/5 bg-black/[0.02]",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={[
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    isToday
                      ? "bg-black text-white"
                      : inCurrentMonth
                      ? "text-black"
                      : "text-black/35",
                  ].join(" ")}
                >
                  {day.getDate()}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={`${event.id}-${day.toISOString()}`}
                    className="rounded-lg bg-white px-2 py-1 text-[11px] leading-4 text-black shadow-sm ring-1 ring-black/5"
                    title={event.title}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    <div className="truncate text-black/55">
                      {isAllDayEvent(event)
                        ? "All day"
                        : new Date(event.start_time).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                    </div>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="px-1 text-[11px] text-black/55">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}