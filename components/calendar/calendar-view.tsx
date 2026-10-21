// components/calendar/calendar-view.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import CalendarMonthView from "@/components/calendar/calendar-month-view";
import CalendarWeekView from "@/components/calendar/calendar-week-view";
import CalendarAgendaView from "@/components/calendar/calendar-agenda-view";

import type { CalendarEntry } from "@/components/calendar/calendar-types";

import { useUserTimeZone } from "@/lib/hooks/use-user-timezone";

import {
  eventOverlapsDateRange,
  getCalendarDateKey,
  startOfCalendarWeek,
} from "@/lib/calendar/date-utils";

type ViewKey = "month" | "week" | "agenda";

type CalendarViewProps = {
  entries: CalendarEntry[];
};

const viewOptions: { key: ViewKey; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "agenda", label: "Agenda" },
];

function entryOverlapsRange(
  entry: CalendarEntry,
  startKey: string,
  endKey: string,
  timeZone: string
) {
  if (entry.kind === "event") {
    return eventOverlapsDateRange(
      entry,
      startKey,
      endKey,
      timeZone
    );
  }

  // Date-only deadlines are never converted to timestamps.
  return (
    entry.start_time >= startKey &&
    entry.start_time <= endKey
  );
}

function getEntryCount(
  entries: CalendarEntry[],
  view: ViewKey,
  currentDate: Date,
  timeZone: string
) {
  if (view === "agenda") return entries.length;

  let start: Date;
  let end: Date;

  if (view === "month") {
    start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
  } else {
    start = startOfCalendarWeek(currentDate);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  }

  const startKey = getCalendarDateKey(start);
  const endKey = getCalendarDateKey(end);

  return entries.filter((entry) =>
    entryOverlapsRange(entry, startKey, endKey, timeZone)
  ).length;
}

export default function CalendarView({
  entries,
}: CalendarViewProps) {
  const [view, setView] = useState<ViewKey>("month");

  const [currentDate, setCurrentDate] = useState<Date>(
    () => new Date(2000, 0, 1)
  );

  const [isReady, setIsReady] = useState(false);
  const timeZone = useUserTimeZone();

  useEffect(() => {
    if (!timeZone) return;

    setCurrentDate(new Date());
    setIsReady(true);
  }, [timeZone]);

  const heading = useMemo(() => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    if (view === "week") {
      const start = startOfCalendarWeek(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return "All calendar entries";
  }, [currentDate, view]);

  const visibleEntryCount = useMemo(() => {
    if (!timeZone) return 0;

    return getEntryCount(
      entries,
      view,
      currentDate,
      timeZone
    );
  }, [entries, view, currentDate, timeZone]);

  function goPrevious() {
    setCurrentDate((previous) => {
      if (view === "month") {
        return new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        );
      }

      const next = new Date(previous);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }

  function goNext() {
    setCurrentDate((previous) => {
      if (view === "month") {
        return new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        );
      }

      const next = new Date(previous);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // All hooks must run before this conditional return.
  if (!isReady || !timeZone) {
    return (
      <section
        role="status"
        aria-label="Loading calendar"
        className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-black/10" />
          <div className="h-8 w-48 rounded bg-black/10" />
          <div className="h-4 w-40 rounded bg-black/5" />
          <div className="h-64 rounded-2xl bg-black/5" />
        </div>
        <span className="sr-only">
          Loading your local calendar...
        </span>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-black/55">
            Visual calendar
          </p>

          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">
            {heading}
          </h3>

          <p className="mt-2 text-sm text-black/60">
            {visibleEntryCount}{" "}
            {visibleEntryCount === 1 ? "entry" : "entries"}{" "}
            in this view.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            role="group"
            aria-label="Calendar view"
            className="flex flex-wrap gap-2"
          >
            {viewOptions.map((option) => {
              const isActive = view === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setView(option.key)}
                  aria-pressed={isActive}
                  className={[
                    "min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                    isActive
                      ? "bg-black text-white"
                      : "border border-black/10 bg-white text-black hover:bg-black/5",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {view !== "agenda" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goPrevious}
                className="min-h-11 rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={goToday}
                className="min-h-11 rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2 text-sm font-semibold text-black hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goNext}
                className="min-h-11 rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {view === "month" && (
          <CalendarMonthView
            entries={entries}
            currentDate={currentDate}
            timeZone={timeZone}
          />
        )}

        {view === "week" && (
          <CalendarWeekView
            entries={entries}
            currentDate={currentDate}
            timeZone={timeZone}
          />
        )}

        {view === "agenda" && (
          <CalendarAgendaView
            entries={entries}
            timeZone={timeZone}
          />
        )}
      </div>
    </section>
  );
}