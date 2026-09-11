import type { ReactElement } from "react";
import { Skeleton } from "@pte/ui";

export default function Loading(): ReactElement {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
