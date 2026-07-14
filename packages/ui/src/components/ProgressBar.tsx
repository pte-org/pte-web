import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export type ProgressTone = "success" | "warning" | "danger";

interface ProgressBarProps {
  value: number;
  max: number;
  tone?: ProgressTone;
  /** Accessible name for the bar. */
  label?: string;
  className?: string;
}

// `<progress>` handles the fill width natively, so no runtime inline width is
// needed (which would violate the no-inline-style rule). Colours are applied to
// the value pseudo-elements for both WebKit and Firefox.
const TONE_CLASS: Record<ProgressTone, string> = {
  success:
    "[&::-webkit-progress-value]:bg-green-500 [&::-moz-progress-bar]:bg-green-500",
  warning:
    "[&::-webkit-progress-value]:bg-amber-500 [&::-moz-progress-bar]:bg-amber-500",
  danger:
    "[&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500",
};

export const ProgressBar = ({
  value,
  max,
  tone = "success",
  label,
  className,
}: ProgressBarProps): ReactElement => (
  <progress
    value={value}
    max={max}
    aria-label={label}
    className={cn(
      "h-2 w-full appearance-none overflow-hidden rounded-full bg-gray-200",
      "[&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-gray-200",
      "[&::-webkit-progress-value]:rounded-full",
      TONE_CLASS[tone],
      className,
    )}
  />
);
