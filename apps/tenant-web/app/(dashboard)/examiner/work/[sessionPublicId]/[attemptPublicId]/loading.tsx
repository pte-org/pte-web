import type { ReactElement } from "react";
import { Skeleton } from "@pte/ui";

export default function ExaminerAttemptDetailLoading(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-5 sm:p-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-1">
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}
