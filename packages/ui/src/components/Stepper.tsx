import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { CheckIcon } from "./icons";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: string;
  /** Shows a tick instead of the number on steps already passed. */
  checkCompleted?: boolean;
  /** Makes steps already passed clickable, so a person can go back to fix them. */
  onStepSelect?: (stepId: string) => void;
}

const CARD_CLASS = "rounded-xl border transition-colors";
const BODY_CLASS = "flex items-start gap-3 p-3";

export const Stepper = ({
  steps,
  currentStep,
  checkCompleted = false,
  onStepSelect,
}: StepperProps): ReactElement => {
  const currentIndex = steps.findIndex((item) => item.id === currentStep);

  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        const isComplete = index < currentIndex;
        const showCheck = checkCompleted && isComplete;
        const content: ReactNode = (
          <>
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                showCheck
                  ? "bg-[var(--mint-tint)] text-[var(--mint-action)]"
                  : isCurrent || isComplete
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
              )}
            >
              {showCheck ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--ink-primary)]">{step.label}</span>
              {step.description && (
                <span className="mt-0.5 block text-xs text-[var(--ink-secondary)]">{step.description}</span>
              )}
            </span>
          </>
        );
        const cardClass = cn(
          CARD_CLASS,
          isCurrent
            ? "border-[var(--brand)] bg-[var(--brand-tint)]"
            : "border-[var(--shell-border)] bg-[var(--surface-card)]",
        );

        if (onStepSelect && isComplete) {
          return (
            <li key={step.id} className={cn(cardClass, "hover:bg-[var(--surface-subtle)]")}>
              <button
                type="button"
                onClick={() => onStepSelect(step.id)}
                className={cn(
                  BODY_CLASS,
                  "w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                )}
              >
                {content}
              </button>
            </li>
          );
        }
        return (
          <li key={step.id} aria-current={isCurrent ? "step" : undefined} className={cn(cardClass, BODY_CLASS)}>
            {content}
          </li>
        );
      })}
    </ol>
  );
};
