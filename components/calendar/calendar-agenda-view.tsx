// components/calendar/calendar-agenda-view.tsx

import Link from "next/link";

import type { CalendarEntry } from "@/components/calendar/calendar-types";

import {
  formatZonedDateTime,
  formatZonedTime,
  getZonedDateKey,
} from "@/lib/calendar/date-utils";

type CalendarAgendaViewProps = {
  entries: CalendarEntry[];
  timeZone: string;
};

/* ==========================================================
   DATE HELPERS
========================================================== */

function getEntryDateKey(
  entry: CalendarEntry,
  timeZone: string
): string {
  if (entry.kind === "event") {
    return getZonedDateKey(entry.start_time, timeZone);
  }

  return entry.start_time;
}

function formatGroupDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

/* ==========================================================
   ENTRY DISPLAY HELPERS
========================================================== */

function getEntryDescription(
  entry: CalendarEntry,
  timeZone: string,
  todayKey: string
): string {
  if (entry.kind === "task") {
    if (entry.completed) {
      return "Completed task";
    }

    if (entry.start_time < todayKey) {
      return "Overdue task";
    }

    if (entry.start_time === todayKey) {
      return "Due today";
    }

    return "Task deadline";
  }

  if (entry.kind === "project") {
    if (entry.start_time < todayKey) {
      return "Past project deadline";
    }

    if (entry.start_time === todayKey) {
      return "Project deadline today";
    }

    return "Project deadline";
  }

  const startKey = getZonedDateKey(
    entry.start_time,
    timeZone
  );

  const endKey = getZonedDateKey(
    entry.end_time,
    timeZone
  );

  if (startKey === endKey) {
    return `${formatZonedTime(
      entry.start_time,
      timeZone
    )} – ${formatZonedTime(
      entry.end_time,
      timeZone
    )}`;
  }

  return `Starts ${formatZonedDateTime(
    entry.start_time,
    timeZone
  )} · Ends ${formatZonedDateTime(
    entry.end_time,
    timeZone
  )}`;
}

function getEntryKindLabel(entry: CalendarEntry): string {
  switch (entry.kind) {
    case "task":
      return "Task";

    case "project":
      return "Project";

    default:
      return "Event";
  }
}

function getEntryStyles(entry: CalendarEntry): string {
  if (entry.kind === "task") {
    return entry.completed
      ? "border-green-200 bg-green-50"
      : "border-[#d7bfa8]/70 bg-[#fff7ed]";
  }

  if (entry.kind === "project") {
    return "border-black/15 bg-black/5";
  }

  return "border-black/10 bg-[#fafaf7]";
}

/* ==========================================================
   CALENDAR AGENDA VIEW
========================================================== */

export default function CalendarAgendaView({
  entries,
  timeZone,
}: CalendarAgendaViewProps) {
  const todayKey = getZonedDateKey(new Date(), timeZone);

  /* --------------------------------------------------------
     GROUP ENTRIES BY CALENDAR DATE
  -------------------------------------------------------- */

  const grouped = entries.reduce<
    Record<string, CalendarEntry[]>
  >((groups, entry) => {
    const key = getEntryDateKey(entry, timeZone);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(entry);

    return groups;
  }, {});

  const dates = Object.keys(grouped).sort();

  /* --------------------------------------------------------
     EMPTY STATE
  -------------------------------------------------------- */

  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
        <p className="text-sm font-semibold text-black">
          Nothing on the calendar yet
        </p>

        <p className="mt-2 text-sm leading-6 text-black/60">
          Add an event, task deadline, or project deadline
          to begin building your schedule.
        </p>
      </div>
    );
  }

  /* ========================================================
     AGENDA
  ======================================================== */

  return (
    <div className="space-y-5">
      {dates.map((dateKey) => {
        const dayEntries = [...grouped[dateKey]].sort(
          (a, b) => {
            // Show deadlines before scheduled events.
            if (
              a.kind !== "event" &&
              b.kind === "event"
            ) {
              return -1;
            }

            if (
              a.kind === "event" &&
              b.kind !== "event"
            ) {
              return 1;
            }

            return a.start_time.localeCompare(b.start_time);
          }
        );

        return (
          <section key={dateKey} className="space-y-3">
            {/* DATE HEADING */}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 sm:text-sm">
                {formatGroupDate(dateKey)}
              </h4>

              <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/55">
                {dayEntries.length}
              </span>
            </div>

            {/* ENTRIES */}

            <div className="space-y-3">
              {dayEntries.map((entry) => {
                const description = getEntryDescription(
                  entry,
                  timeZone,
                  todayKey
                );

                const content = (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h5 className="break-words text-base font-semibold text-black">
                        {entry.title}
                      </h5>

                      <p
                        className={[
                          "mt-2 text-sm leading-6",
                          entry.kind === "task" &&
                          !entry.completed &&
                          entry.start_time < todayKey
                            ? "font-medium text-red-700"
                            : "text-black/60",
                        ].join(" ")}
                      >
                        {description}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/60">
                      {getEntryKindLabel(entry)}
                    </span>
                  </div>
                );

                const className = [
                  "block rounded-2xl border p-4",
                  getEntryStyles(entry),
                  entry.href
                    ? "transition hover:border-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    : "",
                ].join(" ");

                if (entry.href) {
                  return (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <article
                    key={entry.id}
                    className={className}
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}