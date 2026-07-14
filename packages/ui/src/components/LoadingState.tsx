import type { ReactElement } from "react";
import { Skeleton } from "./Skeleton";

interface LoadingStateProps {
  rows?: number;
}

export const LoadingState = ({ rows = 3 }: LoadingStateProps): ReactElement => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} className="h-12 w-full" />
    ))}
  </div>
);
