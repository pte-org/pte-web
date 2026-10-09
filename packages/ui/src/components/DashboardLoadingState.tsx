import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { LoadingState } from "./LoadingState";
import { Skeleton } from "./Skeleton";

export type DashboardLoadingVariant = "page" | "detail" | "table";

export interface DashboardLoadingStateProps {
  variant?: DashboardLoadingVariant;
  label?: string;
  className?: string;
}

const DetailPanel = (): ReactElement => (
  <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
    <Skeleton className="h-5 w-40" />
    <div className="mt-5 space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-5/6" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  </div>
);

export const DashboardLoadingState = ({
  variant = "page",
  label = "Đang tải trang",
  className,
}: DashboardLoadingStateProps): ReactElement => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className={cn("space-y-6", className)}
  >
    <span className="sr-only">{label}</span>

    {variant === "table" ? (
      <>
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-32" />
        </div>
        <LoadingState rows={5} variant="table" announce={false} />
      </>
    ) : variant === "detail" ? (
      <>
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DetailPanel />
          <DetailPanel />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
            >
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="mt-5 h-8 w-1/3" />
            </div>
          ))}
        </div>
        <LoadingState rows={5} variant="table" announce={false} />
      </>
    )}
  </div>
);
