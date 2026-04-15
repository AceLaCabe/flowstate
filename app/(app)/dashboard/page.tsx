// /app/(app)/dashboard/page.tsx

import { Suspense } from "react";
import DashboardFallback from "./dashboard-fallback";
import DashboardContent from "./dashboard-content";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}