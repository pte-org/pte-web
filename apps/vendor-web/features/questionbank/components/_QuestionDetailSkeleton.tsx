import type { ReactElement } from "react";
import { Skeleton } from "@pte/ui";

const SKELETON_CARD_ROWS = [0, 1, 2, 3];

const SkeletonCard = (): ReactElement => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
    <Skeleton className="h-5 w-40" />
    <div className="mt-5 space-y-4">
      {SKELETON_CARD_ROWS.map((row) => (
        <div key={row} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  </div>
);

/** The detail page's own shape (cards on the left, the student's task on the right), so the content lands in place. */
export const QuestionDetailSkeleton = (): ReactElement => (
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start" aria-busy="true">
    <div className="flex flex-col gap-5">
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <Skeleton className="h-96 w-full rounded-lg" />
  </div>
);
