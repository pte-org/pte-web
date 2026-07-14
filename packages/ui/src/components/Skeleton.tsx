import type { ReactElement } from "react";
import { cn } from "../utils/cn";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps): ReactElement => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded bg-gray-200", className)}
  />
);
