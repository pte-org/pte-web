import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { DashboardCard } from "./DashboardCard";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
  compact?: boolean;
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
  /** Semantic pastel wash used by the design system for the icon tile. */
  accent?: "blue" | "sky" | "mint" | "cream" | "blush";
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "bg-[var(--brand-tint)] text-[var(--brand-ink)]",
  sky: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  mint: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  cream: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  blush: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
};

export const StatCard = ({
  label,
  value,
  className,
  compact = false,
  icon,
  trend,
  trendPositive = true,
  footnote,
  highlight = false,
  progress,
  accent,
}: StatCardProps): ReactElement => {
  const progressValue = progress === undefined ? undefined : Math.min(Math.max(progress, 0), 100);
  const progressTone = highlight
    ? "[&::-webkit-progress-value]:bg-amber-500 [&::-moz-progress-bar]:bg-amber-500"
    : trendPositive
      ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
      : "[&::-webkit-progress-value]:bg-rose-500 [&::-moz-progress-bar]:bg-rose-500";

  return (
    <DashboardCard
      className={cn(
        "relative overflow-hidden shadow-none motion-safe:animate-pte-scale-in transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-lg",
              compact ? "h-9 w-9 [&>svg]:h-4 [&>svg]:w-4" : "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
              ACCENT_CLASSES[accent ?? (highlight ? "cream" : "blue")],
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className={cn(compact ? "mt-4" : "mt-5", "flex items-end justify-between gap-3")}>
        <div>
          <p className="text-sm font-normal text-[var(--ink-secondary)]">{label}</p>
          <div className="mt-2 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                "text-2xl font-light leading-none",
                  trendPositive ? "text-[var(--mint-action)]" : "text-[var(--blush-action)]",
                )}
              >
                {trendPositive ? "+" : "-"}
              </span>
            )}
            <span
              className={cn(
                compact ? "text-xl" : "text-2xl",
                "font-semibold tabular-nums text-[var(--ink-primary)]",
              )}
            >
              {value}
            </span>
          </div>
        </div>

        {trend && <span className="text-sm font-normal text-[var(--ink-muted)]">{trend}</span>}
      </div>

      {progressValue !== undefined && (
        <div className="mt-4">
          <progress
            value={progressValue}
            max={100}
            aria-label={label}
            className={cn(
              "block h-1.5 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[var(--surface-subtle)] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:rounded-full",
              progressTone,
            )}
          />
        </div>
      )}

      {footnote && (
        <p className={cn(compact ? "mt-2" : "mt-3", "text-xs font-normal text-[var(--ink-muted)]")}>
          {footnote}
        </p>
      )}
    </DashboardCard>
  );
};
