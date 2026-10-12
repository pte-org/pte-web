import type { ReactElement } from "react";
import { Skeleton } from "@pte/ui";

export default function ExaminerSessionSegmentLoading(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-5 sm:p-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
