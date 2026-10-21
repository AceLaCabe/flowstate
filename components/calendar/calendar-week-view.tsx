// components/calendar/calendar-week-view.tsx

import Link from "next/link";

import type { CalendarEntry } from "@/components/calendar/calendar-types";

import {
  eventOccursOnDate,
  getCalendarDateKey,
  getEventDayLabel,
  startOfCalendarWeek,
} from "@/lib/calendar/date-utils";

type CalendarWeekViewProps = {
  entries: CalendarEntry[];
  currentDate: Date;
  timeZone: string;
};

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
    return entry.completed ? "Task completed" : "Task due";
  }

  return "Project deadline";
}

function getEntryStyles(entry: CalendarEntry) {
  if (entry.kind === "task") {
    return entry.completed
      ? "border-green-200 bg-green-50"
      : "border-[#d7bfa8]/70 bg-[#fff7ed]";
  }

  if (entry.kind === "project") {
    return "border-black/15 bg-black/5";
  }

  return "border-black/10 bg-white";
}

export default function CalendarWeekView({
  entries,
  currentDate,
  timeZone,
}: CalendarWeekViewProps) {
  const weekStart = startOfCalendarWeek(currentDate);
  const todayKey = getCalendarDateKey(new Date());

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {days.map((day) => {
        const dayKey = getCalendarDateKey(day);
        const isToday = dayKey === todayKey;

        const dayEntries = entries.filter((entry) =>
          occursOnDate(entry, day, timeZone)
        );

        return (
          <section
            key={dayKey}
            className={[
              "min-w-0 rounded-2xl border p-3",
              isToday
                ? "border-[#d7bfa8]/70 bg-[#fff7ed]"
                : "border-black/10 bg-[#fafaf7]",
            ].join(" ")}
          >
            <div className="mb-3 border-b border-black/5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {day.toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>

                {isToday && (
                  <span className="rounded-full bg-[#8f5f45] px-2 py-0.5 text-[10px] font-semibold text-white">
                    Today
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-semibold text-black">
                {day.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-2">
              {dayEntries.length > 0 ? (
                dayEntries.map((entry) => {
                  const content = (
                    <>
                      <p className="break-words text-sm font-semibold text-black">
                        {entry.title}
                      </p>

                      <p className="mt-1 text-xs text-black/60">
                        {getEntryLabel(entry, day, timeZone)}
                      </p>
                    </>
                  );

                  const className = [
                    "block min-w-0 rounded-xl border p-3",
                    getEntryStyles(entry),
                    entry.href
                      ? "transition hover:border-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      : "",
                  ].join(" ");

                  return entry.href ? (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      className={className}
                    >
                      {content}
                    </Link>
                  ) : (
                    <article
                      key={entry.id}
                      className={className}
                    >
                      {content}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-black/10 bg-white/60 p-3">
                  <p className="text-xs text-black/45">
                    Nothing scheduled
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}