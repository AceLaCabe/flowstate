// components/calendar/calendar-month-view.tsx

import Link from "next/link";

import type { CalendarEntry } from "@/components/calendar/calendar-types";

import {
  eventOccursOnDate,
  getCalendarDateKey,
  getEventDayLabel,
} from "@/lib/calendar/date-utils";

type CalendarMonthViewProps = {
  entries: CalendarEntry[];
  currentDate: Date;
  timeZone: string;
};

const weekdayLabels = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
];

function startOfMonthGrid(date: Date) {
  const first = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  start.setHours(0, 0, 0, 0);

  return start;
}

function occursOnDate(
  entry: CalendarEntry,
  date: Date,
  timeZone: string
) {
  if (entry.kind === "event") {
    return eventOccursOnDate(entry, date, timeZone);
  }

  return entry.start_time === getCalendarDateKey(date);
}

function getEntryLabel(
  entry: CalendarEntry,
  date: Date,
  timeZone: string
) {
  if (entry.kind === "event") {
    return getEventDayLabel(entry, date, timeZone);
  }

  if (entry.kind === "task") {
    return entry.completed ? "Completed" : "Due";
  }

  return "Deadline";
}

function getEntryStyles(entry: CalendarEntry) {
  if (entry.kind === "task") {
    return entry.completed
      ? "border-green-200 bg-green-50 text-green-900"
      : "border-[#d7bfa8]/70 bg-[#fff7ed] text-[#3b2418]";
  }

  if (entry.kind === "project") {
    return "border-black/15 bg-black text-white";
  }

  return "border-black/10 bg-white text-black";
}

export default function CalendarMonthView({
  entries,
  currentDate,
  timeZone,
}: CalendarMonthViewProps) {
  const gridStart = startOfMonthGrid(currentDate);
  const todayKey = getCalendarDateKey(new Date());

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-1 sm:gap-2">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="min-w-0 py-2 text-center text-[10px] font-medium uppercase tracking-normal text-black/50 sm:text-xs sm:tracking-[0.12em]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const dayKey = getCalendarDateKey(day);
          const isToday = dayKey === todayKey;

          const inCurrentMonth =
            day.getMonth() === currentDate.getMonth() &&
            day.getFullYear() === currentDate.getFullYear();

          const dayEntries = entries.filter((entry) =>
            occursOnDate(entry, day, timeZone)
          );

          return (
            <div
              key={dayKey}
              className={[
                "min-h-[120px] min-w-0 rounded-2xl border p-1.5 sm:p-2",
                inCurrentMonth
                  ? "border-black/10 bg-[#fafaf7]"
                  : "border-black/5 bg-black/[0.02]",
              ].join(" ")}
            >
              <div className="mb-2">
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
                {dayEntries.slice(0, 3).map((entry) => {
                  const content = (
                    <>
                      <div className="truncate font-semibold">
                        {entry.title}
                      </div>

                      <div
                        className={[
                          "truncate",
                          entry.kind === "project"
                            ? "text-white/75"
                            : "opacity-65",
                        ].join(" ")}
                      >
                        {getEntryLabel(entry, day, timeZone)}
                      </div>
                    </>
                  );

                  const className = [
                    "block min-w-0 rounded-lg border px-1.5 py-1 text-[11px] leading-4 sm:px-2",
                    getEntryStyles(entry),
                    entry.href
                      ? "transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      : "",
                  ].join(" ");

                  return entry.href ? (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      title={`${entry.title} — ${getEntryLabel(
                        entry,
                        day,
                        timeZone
                      )}`}
                      className={className}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={entry.id}
                      title={entry.title}
                      className={className}
                    >
                      {content}
                    </div>
                  );
                })}

                {dayEntries.length > 3 && (
                  <div className="px-1 text-[11px] text-black/55">
                    +{dayEntries.length - 3} more
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