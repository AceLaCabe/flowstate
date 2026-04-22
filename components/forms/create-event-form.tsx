// components/forms/create-event-form.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateEventFormProps = {
  workspaceId: string;
};

function startOfDayISOString(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function endOfDayISOString(dateValue: string) {
  return new Date(`${dateValue}T23:59:00`).toISOString();
}

export default function CreateEventForm({
  workspaceId,
}: CreateEventFormProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle("");
    setIsAllDay(false);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setError(null);
    setIsExpanded(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const supabase = createClient();
    setError(null);

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter an event title.");
      return;
    }

    let startISO = "";
    let endISO = "";

    if (isAllDay) {
      if (!startDate) {
        setError("Please choose a start date.");
        return;
      }

      const resolvedEndDate = endDate || startDate;

      if (new Date(resolvedEndDate).getTime() < new Date(startDate).getTime()) {
        setError("End date cannot be before start date.");
        return;
      }

      startISO = startOfDayISOString(startDate);
      endISO = endOfDayISOString(resolvedEndDate);
    } else {
      if (!startTime) {
        setError("Please choose a start time.");
        return;
      }

      if (!endTime) {
        setError("Please choose an end time.");
        return;
      }

      if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
        setError("End time must be after start time.");
        return;
      }

      startISO = new Date(startTime).toISOString();
      endISO = new Date(endTime).toISOString();
    }

    startTransition(async () => {
      const { error } = await supabase.from("events").insert({
        workspace_id: workspaceId,
        title: trimmedTitle,
        start_time: startISO,
        end_time: endISO,
      });

      if (error) {
        setError(error.message);
        return;
      }

      resetForm();
      router.refresh();
    });
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-5 py-4 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:w-auto"
      >
        + New Event
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-black">Create Event</h3>
          <p className="mt-1 text-sm text-black/65">
            Add a new calendar event to your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex w-fit items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleCreateEvent} className="space-y-5">
        <div className="grid gap-2">
          <label htmlFor="event-title" className="text-sm font-medium text-black">
            Event title
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Client review meeting"
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30 focus:ring-2 focus:ring-black/10"
            required
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm text-black">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          All-day event
        </label>

        {isAllDay ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="event-start-date" className="text-sm font-medium text-black">
                Start date
              </label>
              <input
                id="event-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="event-end-date" className="text-sm font-medium text-black">
                End date <span className="text-black/45">(optional)</span>
              </label>
              <input
                id="event-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="event-start-time"
                className="text-sm font-medium text-black"
              >
                Start time
              </label>
              <input
                id="event-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="event-end-time"
                className="text-sm font-medium text-black"
              >
                End time
              </label>
              <input
                id="event-end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
                required
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            {isPending ? "Creating event..." : "Create Event"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}