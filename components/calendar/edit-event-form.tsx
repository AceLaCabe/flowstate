// components/calendar/edit-event-form.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EventTypeOption = {
  id: string;
  name: string;
  color: string;
};

type EditEventFormProps = {
  eventId: string;
  initialTitle: string;
  initialStartTime: string;
  initialEndTime: string;
  initialEventTypeId: string | null;
  eventTypes: EventTypeOption[];
};

function toLocalDateTimeValue(isoString: string) {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateValue(isoString: string) {
  return toLocalDateTimeValue(isoString).slice(0, 10);
}

function startOfDayISOString(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function endOfDayISOString(dateValue: string) {
  return new Date(`${dateValue}T23:59:00`).toISOString();
}

function isMidnightToEndOfDay(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return (
    startDate.getHours() === 0 &&
    startDate.getMinutes() === 0 &&
    endDate.getHours() === 23 &&
    endDate.getMinutes() === 59
  );
}

export default function EditEventForm({
  eventId,
  initialTitle,
  initialStartTime,
  initialEndTime,
  initialEventTypeId,
  eventTypes,
}: EditEventFormProps) {
  const router = useRouter();
  const initialAllDay = isMidnightToEndOfDay(initialStartTime, initialEndTime);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [eventTypeId, setEventTypeId] = useState(
    initialEventTypeId ?? eventTypes[0]?.id ?? ""
  );
  const [isAllDay, setIsAllDay] = useState(initialAllDay);
  const [startDate, setStartDate] = useState(toDateValue(initialStartTime));
  const [endDate, setEndDate] = useState(toDateValue(initialEndTime));
  const [startTime, setStartTime] = useState(
    toLocalDateTimeValue(initialStartTime)
  );
  const [endTime, setEndTime] = useState(toLocalDateTimeValue(initialEndTime));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle(initialTitle);
    setEventTypeId(initialEventTypeId ?? eventTypes[0]?.id ?? "");
    setIsAllDay(initialAllDay);
    setStartDate(toDateValue(initialStartTime));
    setEndDate(toDateValue(initialEndTime));
    setStartTime(toLocalDateTimeValue(initialStartTime));
    setEndTime(toLocalDateTimeValue(initialEndTime));
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
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
      if (!startTime || !endTime) {
        setError("Please choose a start and end time.");
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
      const { error } = await supabase
        .from("events")
        .update({
          title: trimmedTitle,
          start_time: startISO,
          end_time: endISO,
          event_type_id: eventTypeId || null,
        })
        .eq("id", eventId);

      if (error) {
        setError(error.message);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex w-fit items-center justify-center rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        Edit
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-4 space-y-4 rounded-xl border border-black/10 bg-white p-4"
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium text-black">Event title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-black">Event type</label>
        <select
          value={eventTypeId}
          onChange={(e) => setEventTypeId(e.target.value)}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
        >
          {eventTypes.length > 0 ? (
            eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))
          ) : (
            <option value="">No event types yet</option>
          )}
        </select>
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
            <label className="text-sm font-medium text-black">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-black">
              End date <span className="text-black/45">(optional)</span>
            </label>
            <input
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
            <label className="text-sm font-medium text-black">Start time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/10"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-black">End time</label>
            <input
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
          {isPending ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}