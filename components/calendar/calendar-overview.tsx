// components/calendar/calendar-overview.tsx

"use client";

import { useEffect, useState } from "react";

import type { CalendarEntry } from "@/components/calendar/calendar-types";
import { getZonedDateKey } from "@/lib/calendar/date-utils";
import { useUserTimeZone } from "@/lib/hooks/use-user-timezone";

type CalendarOverviewProps = {
  entries: CalendarEntry[];
};

function addCalendarDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

export default function CalendarOverview({
  entries,
}: CalendarOverviewProps) {
  const timeZone = useUserTimeZone();

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Server and initial client render must match.
  if (!timeZone || !now) {
    return (
      <section
        aria-label="Schedule overview"
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-semibold text-black">
            Schedule overview
          </h3>
          <p className="mt-1 text-sm text-black/55">
            Your calendar activity at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-black/10 bg-white"
            />
          ))}
        </div>
      </section>
    );
  }

  const todayKey = getZonedDateKey(now, timeZone);
  const endKey = addCalendarDays(todayKey, 7);
  const nowMs = now.getTime();

  const deadlines = entries.filter(
    (entry) => entry.kind !== "event"
  );

  const dueToday = deadlines.filter(
    (entry) =>
      entry.start_time === todayKey &&
      (entry.kind !== "task" || !entry.completed)
  ).length;

  // Future seven calendar days, excluding today.
  const nextSevenDays = deadlines.filter(
    (entry) =>
      entry.start_time > todayKey &&
      entry.start_time <= endKey &&
      (entry.kind !== "task" || !entry.completed)
  ).length;

  const upcomingEvents = entries.filter(
    (entry) =>
      entry.kind === "event" &&
      new Date(entry.end_time).getTime() >= nowMs
  ).length;

  const overdueTasks = entries.filter(
    (entry) =>
      entry.kind === "task" &&
      !entry.completed &&
      entry.start_time < todayKey
  ).length;

  return (
    <section
      aria-labelledby="calendar-overview-heading"
      className="space-y-4"
    >
      <div>
        <h3
          id="calendar-overview-heading"
          className="text-lg font-semibold tracking-tight text-black"
        >
          Schedule overview
        </h3>

        <p className="mt-1 text-sm text-black/55">
          What needs attention across your calendar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Due today"
          value={dueToday}
          description="Tasks and project deadlines"
          warm={dueToday > 0}
        />

        <MetricCard
          label="Next 7 days"
          value={nextSevenDays}
          description="Upcoming deadlines"
        />

        <MetricCard
          label="Upcoming events"
          value={upcomingEvents}
          description="Scheduled events not yet ended"
        />

        <MetricCard
          label="Overdue tasks"
          value={overdueTasks}
          description="Unfinished and past due"
          warm={overdueTasks > 0}
        />
      </div>
    </section>
  );
}

function MetricCard({
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
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        warm
          ? "border-[#d7bfa8]/60 bg-[#fff7ed]"
          : "border-black/10 bg-white"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          warm ? "text-[#7b533e]" : "text-black/65"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          warm ? "text-[#3b2418]" : "text-black"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-sm ${
          warm ? "text-[#7b533e]" : "text-black/55"
        }`}
      >
        {description}
      </p>
    </div>
  );
}