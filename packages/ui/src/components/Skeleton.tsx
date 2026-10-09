import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps): ReactElement => (
  <div aria-hidden="true" className={cn("pte-skeleton rounded bg-[var(--skeleton-base)]", className)} />
);
