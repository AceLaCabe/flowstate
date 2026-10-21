// components/calendar/event-card.tsx

"use client";

import { useUserTimeZone } from "@/lib/hooks/use-user-timezone";
import { formatZonedDateTime } from "@/lib/calendar/date-utils";
import EditEventForm from "@/components/calendar/edit-event-form";
import DeleteEventButton from "@/components/calendar/delete-event-button";

type EventCardProps = {
  event: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
  };
  past?: boolean;
};

export default function EventCard({
  event,
  past = false,
}: EventCardProps) {
  const timeZone = useUserTimeZone();

  return (
    <article
      className={`rounded-2xl border border-black/10 bg-[#fafaf7] p-4 transition hover:border-black/20 hover:shadow-sm ${
        past ? "opacity-80" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h5 className="break-words text-base font-semibold text-black">
            {event.title}
          </h5>

          {timeZone ? (
            <>
              <p className="mt-2 text-sm text-black/60">
                Starts:{" "}
                {formatZonedDateTime(event.start_time, timeZone)}
              </p>

              <p className="mt-1 text-sm text-black/55">
                Ends:{" "}
                {formatZonedDateTime(event.end_time, timeZone)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-black/50">
              Loading local event times...
            </p>
          )}
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black/60">
          {past ? "Past" : "Scheduled"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/10 pt-4">
        <EditEventForm
          eventId={event.id}
          initialTitle={event.title}
          initialStartTime={event.start_time}
          initialEndTime={event.end_time}
        />

        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}