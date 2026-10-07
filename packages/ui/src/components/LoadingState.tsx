import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { Skeleton } from "./Skeleton";

export type LoadingStateVariant = "rows" | "table";

export interface LoadingStateProps {
  rows?: number;
  variant?: LoadingStateVariant;
  label?: string;
  className?: string;
}

const ROW_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-5/6", "w-3/4", "w-2/3"] as const;
const TABLE_COLUMN_WIDTHS = ["w-1/5", "w-1/4", "w-2/5", "w-1/6", "w-1/4"] as const;

export const LoadingState = ({
  rows = 3,
  variant = "rows",
  label = "Loading",
  className,
}: LoadingStateProps): ReactElement => {
  const rowCount = Math.max(1, rows);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("w-full", className)}
    >
      <span className="sr-only">{label}</span>

      {variant === "table" ? (
        <div className="overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-none">
          <div className="flex items-center gap-4 bg-[var(--surface-subtle)] px-5 py-3">
            {TABLE_COLUMN_WIDTHS.map((width, index) => (
              <Skeleton key={index} className={cn("h-3", width)} />
            ))}
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
                {TABLE_COLUMN_WIDTHS.map((width, columnIndex) => (
                  <Skeleton
                    key={columnIndex}
                    className={cn("h-4", columnIndex === 0 ? width : "flex-1")}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rowCount }, (_, index) => (
            <Skeleton
              key={index}
              className={cn("h-12", ROW_WIDTHS[index % ROW_WIDTHS.length])}
            />
          ))}
        </div>
      )}
    </div>
  );
};
