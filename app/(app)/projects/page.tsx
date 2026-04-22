// app/(app)/projects/page.tsx
import { Suspense } from "react";
import ProjectsFallback from "./projects-fallback";
import ProjectsContent from "./projects-content";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <ProjectsContent />
    </Suspense>
  );
}