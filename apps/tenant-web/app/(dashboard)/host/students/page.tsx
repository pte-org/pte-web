"use client";

import { Suspense } from "react";
import { StudentSearchView } from "@/features/studentSearch/components";
import { LoadingState } from "@pte/ui";

export default function StudentsPage() {
  return (
    <Suspense fallback={<LoadingState rows={8} />}>
      <StudentSearchView />
    </Suspense>
  );
}
