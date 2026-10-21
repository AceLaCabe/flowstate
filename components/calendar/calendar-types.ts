// components/calendar/calendar-types.ts

export type CalendarEntryKind =
  | "event"
  | "task"
  | "project";

export type CalendarEntry = {
  id: string;
  title: string;
  kind: CalendarEntryKind;

  // Events contain timestamps.
  // Deadlines contain local calendar dates (YYYY-MM-DD).
  start_time: string;
  end_time: string;

  // Available for navigation when applicable.
  href?: string;

  // Used to distinguish date-only deadlines.
  allDay?: boolean;

  // Optional context for task deadlines.
  completed?: boolean;
};