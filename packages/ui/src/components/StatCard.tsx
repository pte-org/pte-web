import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Short delta shown next to the value, e.g. "67%". */
  trend?: string;
  trendPositive?: boolean;
  /** Secondary caption under the value, e.g. "25% tong kho". */
  footnote?: string;
  /** Amber emphasis for attention cards. */
  highlight?: boolean;
  /** Percentage of progress for the progress bar (0 to 100). */
  progress?: number;
}

export const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  footnote,
  highlight = false,
  progress,
}: StatCardProps): ReactElement => {
  const progressValue =
    progress === undefined ? undefined : Math.min(Math.max(progress, 0), 100);
  const progressTone = highlight
    ? "[&::-webkit-progress-value]:bg-amber-500 [&::-moz-progress-bar]:bg-amber-500"
    : trendPositive
      ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
      : "[&::-webkit-progress-value]:bg-rose-500 [&::-moz-progress-bar]:bg-rose-500";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        highlight && "border-amber-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-normal text-slate-500">{label}</p>
        {icon && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg [&>svg]:h-5 [&>svg]:w-5",
              highlight
                ? "bg-amber-100 text-amber-600"
                : "bg-sky-50 text-blue-600",
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-2xl font-light leading-none",
                trendPositive ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {trendPositive ? "+" : "-"}
            </span>
          )}
          <span className="text-2xl font-semibold text-slate-800">{value}</span>
        </div>

        {trend && (
          <span className="text-sm font-normal text-slate-400">{trend}</span>
        )}
      </div>

      {progressValue !== undefined && (
        <div className="mt-4">
          <progress
            value={progressValue}
            max={100}
            aria-label={label}
            className={cn(
              "block h-1.5 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:rounded-full",
              progressTone,
            )}
          />
        </div>
      )}

      {footnote && (
        <p className="mt-3 text-xs font-normal text-slate-400">{footnote}</p>
      )}
    </div>
  );
};
