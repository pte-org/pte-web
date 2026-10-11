import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export type CircularProgressTone = "brand" | "success" | "warning";

export interface CircularProgressChartProps {
  value: number | null;
  max: number;
  valueLabel: string;
  ariaLabel: string;
  caption?: string;
  tone?: CircularProgressTone;
  className?: string;
}

const TONE_STROKES: Record<CircularProgressTone, string> = {
  brand: "var(--action)",
  success: "var(--mint-action)",
  warning: "var(--cream-action)",
};

const RADIUS = 47;
const CENTER = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clampProgress = (value: number | null, max: number): number => {
  if (value === null || !Number.isFinite(value) || max <= 0) return 0;
  return Math.min(Math.max(value, 0), max);
};

export const CircularProgressChart = ({
  value,
  max,
  valueLabel,
  ariaLabel,
  caption,
  tone = "brand",
  className,
}: CircularProgressChartProps): ReactElement => {
  const progress = clampProgress(value, max);
  const progressRatio = max > 0 ? progress / max : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progressRatio);
  const hasValue = value !== null && Number.isFinite(value);

  return (
    <div
      className={cn("relative h-32 w-32 shrink-0", className)}
      role="img"
      aria-label={`${ariaLabel}: ${valueLabel}`}
    >
      <svg viewBox="0 0 112 112" className="h-full w-full" aria-hidden="true">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--surface-subtle)"
          strokeWidth="10"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={TONE_STROKES[tone]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            "text-xl tabular-nums",
            hasValue
              ? "font-semibold text-[var(--ink-primary)]"
              : "font-normal text-[var(--ink-muted)]",
          )}
        >
          {valueLabel}
        </span>
        {caption && (
          <span className="mt-0.5 max-w-24 text-[10px] text-[var(--ink-muted)]">{caption}</span>
        )}
      </div>
    </div>
  );
};
