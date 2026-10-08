import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export const Stepper = ({
  steps,
  currentStep,
}: {
  steps: StepItem[];
  currentStep: string;
}): ReactElement => (
  <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {steps.map((step, index) => {
      const isCurrent = step.id === currentStep;
      const currentIndex = steps.findIndex((item) => item.id === currentStep);
      const isComplete = index < currentIndex;
      return (
        <li
          key={step.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3 transition-colors",
            isCurrent
              ? "border-[var(--brand)] bg-[var(--brand-tint)]"
              : "border-[var(--shell-border)] bg-[var(--surface-card)]",
          )}
        >
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
              isCurrent || isComplete
                ? "bg-[var(--brand)] text-white"
                : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
            )}
          >
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--ink-primary)]">{step.label}</span>
            {step.description && (
              <span className="mt-0.5 block text-xs text-[var(--ink-secondary)]">{step.description}</span>
            )}
          </span>
        </li>
      );
    })}
  </ol>
);
