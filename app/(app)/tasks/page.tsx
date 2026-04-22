// app/(app)/tasks/page.tsx

import { Suspense } from "react";
import TasksFallback from "./tasks-fallback";
import TasksContent from "./tasks-content";

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksFallback />}>
      <TasksContent />
    </Suspense>
  );
}