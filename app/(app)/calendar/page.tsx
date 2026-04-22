// app/calendar/page.tsx

import { Suspense } from "react";
import CalendarFallback from "./calendar-fallback";
import CalendarContent from "./calendar-content";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarFallback />}>
      <CalendarContent />
    </Suspense>
  );
}