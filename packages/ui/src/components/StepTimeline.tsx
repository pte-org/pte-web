"use client";

import { type ReactNode } from "react";
import { cn } from "../utils/cn";

export type StepStatus = "pending" | "active" | "done" | "failed";

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
  icon?: ReactNode;
  failureReason?: string | null;
}

export interface StepTimelineProps {
  steps: Step[];
  /** "horizontal" or "vertical"; default is horizontal */
  orientation?: "horizontal" | "vertical";
  /** Show failure reasons as plain text under failed steps */
  showFailureReasons?: boolean;
  /** Reduce motion for animations */
  reduceMotion?: boolean;
}

const StatusColors: Record<StepStatus, string> = {
  pending: "bg-gray-200 text-gray-600",
  active: "bg-blue-500 text-white",
  done: "bg-green-500 text-white",
  failed: "bg-red-500 text-white",
};

const StatusIcons: Record<StepStatus, string> = {
  pending: "○",
  active: "◉",
  done: "✓",
  failed: "✕",
};

export const StepTimeline = ({
  steps,
  orientation = "horizontal",
  showFailureReasons = true,
  reduceMotion = false,
}: StepTimelineProps) => {
  const isHorizontal = orientation === "horizontal";
  const shouldReduceMotion = reduceMotion || typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isHorizontal) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  StatusColors[step.status],
                  step.status === "active" && !shouldReduceMotion && "animate-pulse",
                )}
                role="status"
                aria-label={`${step.label}: ${step.status}`}
              >
                {step.icon ?? StatusIcons[step.status]}
              </div>
              {showFailureReasons && step.failureReason && (
                <p className="text-xs text-red-600 mt-1 text-center max-w-[80px]">
                  {step.failureReason}
                </p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 w-8 transition-colors",
                  steps[index + 1]?.status === "pending" ? "bg-gray-200" : "bg-green-500",
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Vertical orientation
  return (
    <div
      className="flex flex-col gap-4"
      role="region"
      aria-label="Step timeline"
      aria-live="polite"
    >
      {steps.map((step) => (
        <div key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                StatusColors[step.status],
                step.status === "active" && !shouldReduceMotion && "animate-pulse",
              )}
              role="status"
              aria-label={`${step.label}: ${step.status}`}
            >
              {step.icon ?? StatusIcons[step.status]}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{step.label}</p>
            {showFailureReasons && step.failureReason && (
              <p className="text-xs text-red-600 mt-1">{step.failureReason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
