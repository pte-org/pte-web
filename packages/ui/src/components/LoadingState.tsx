import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { Skeleton } from "./Skeleton";

export type LoadingStateVariant = "rows" | "table";

export interface LoadingStateProps {
  rows?: number;
  variant?: LoadingStateVariant;
  label?: string;
  announce?: boolean;
  className?: string;
}

const ROW_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-5/6", "w-3/4", "w-2/3"] as const;
const TABLE_COLUMN_COUNT = 5;

export const LoadingState = ({
  rows = 3,
  variant = "rows",
  label = "Đang tải",
  announce = true,
  className,
}: LoadingStateProps): ReactElement => {
  const rowCount = Math.max(1, rows);
  const statusProps = announce
    ? { role: "status" as const, "aria-live": "polite" as const, "aria-label": label }
    : {};

  return (
    <div {...statusProps} className={cn("w-full", className)}>
      {announce && <span className="sr-only">{label}</span>}

      {variant === "table" ? (
        <div className="overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-none">
          <div className="flex items-center gap-4 bg-[var(--surface-subtle)] px-5 py-3">
            {Array.from({ length: TABLE_COLUMN_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-3 min-w-0 flex-1" />
            ))}
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
                {Array.from({ length: TABLE_COLUMN_COUNT }, (_, columnIndex) => (
                  <Skeleton key={columnIndex} className="h-4 min-w-0 flex-1" />
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
