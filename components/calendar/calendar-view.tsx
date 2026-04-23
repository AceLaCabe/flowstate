// components/calendar/calendar-view.tsx

"use client";

import { useMemo, useState } from "react";
import CalendarMonthView from "@/components/calendar/calendar-month-view";
import CalendarWeekView from "@/components/calendar/calendar-week-view";
import CalendarAgendaView from "@/components/calendar/calendar-agenda-view";

export type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
};

type ViewKey = "month" | "week" | "agenda";

type CalendarViewProps = {
  events: CalendarEvent[];
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const viewOptions: { key: ViewKey; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "agenda", label: "Agenda" },
];

export default function CalendarView({ events }: CalendarViewProps) {
  const [view, setView] = useState<ViewKey>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const heading = useMemo(() => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    if (view === "week") {
      const start = startOfWeek(currentDate);
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

    return "All Scheduled Events";
  }, [currentDate, view]);

  const goPrevious = () => {
    const next = new Date(currentDate);

    if (view === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (view === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }

    setCurrentDate(next);
  };

  const goNext = () => {
    const next = new Date(currentDate);

    if (view === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (view === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }

    setCurrentDate(next);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-black/60">Visual calendar</p>
          <h3 className="mt-1 text-2xl font-semibold text-black">{heading}</h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {viewOptions.map((option) => {
              const isActive = view === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setView(option.key)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition",
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrevious}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-black/5"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-black/5"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-black/5"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {view === "month" && (
          <CalendarMonthView events={events} currentDate={currentDate} />
        )}

        {view === "week" && (
          <CalendarWeekView events={events} currentDate={currentDate} />
        )}

        {view === "agenda" && (
          <CalendarAgendaView events={events} currentDate={currentDate} />
        )}
      </div>
    </section>
  );
}