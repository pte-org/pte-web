"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@pte/ui";
import type { AssemblyText } from "../assemblyConstants";
import type { LiveStep, StepId } from "../utils/liveSteps";
import { LiveStepDetail, type StepDetailProps } from "./_LiveStepDetail";

interface LiveStepperProps extends Omit<StepDetailProps, "step"> {
  steps: LiveStep[];
  text: AssemblyText;
}

const LABEL: Record<StepId, keyof AssemblyText> = {
  prompt: "stepPrompt",
  write: "stepWrite",
  validate: "stepValidate",
  review: "stepReview",
  media: "stepMedia",
  assemble: "stepAssemble",
  save: "stepSave",
};

/**
 * The run of one question as a row of steps, each with its own bar: running (a moving shine), done (green) or failed
 * (red), with the writing round and a flag where the reviewer sent a draft back. Clicking a step opens what it did.
 */
export const LiveStepper = ({ steps, text, ...detail }: LiveStepperProps): ReactElement => {
  const [open, setOpen] = useState<StepId | null>(null);
  const openStep = steps.find((step) => step.id === open) ?? null;
  return (
    <div className="mb-4">
      <div className="flex gap-3 border-b border-[var(--border-subtle)]">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            aria-expanded={open === step.id}
            onClick={() => setOpen((current) => (current === step.id ? null : step.id))}
            className={cn(
              "relative min-w-0 flex-1 border-b-2 pb-2.5 text-left transition-colors",
              open === step.id ? "border-[var(--ink-primary)]" : "border-transparent",
            )}
          >
            <span
              className={cn(
                "mb-2 flex items-center gap-1.5 truncate text-[13px]",
                step.status === "waiting" ? "text-[var(--ink-muted)]" : "text-[var(--ink-primary)]",
                step.status === "active" && "font-semibold",
              )}
            >
              {step.round !== null && step.status !== "waiting" && (
                <span className="rounded bg-[var(--surface-subtle)] px-1 font-mono text-[10px] font-semibold text-[var(--ink-secondary)]">
                  {text.round.replace("{n}", String(step.round))}
                </span>
              )}
              {text[LABEL[step.id]]}
              {step.status === "done" && <span className="text-xs text-emerald-600">✓</span>}
            </span>
            <span className="relative block h-1 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                  step.status === "waiting" && "w-0",
                  step.status === "active" && "w-2/3 animate-pulse bg-[var(--action)]",
                  step.status === "done" && "w-full bg-emerald-500",
                  step.status === "failed" && "w-full bg-rose-500",
                )}
              />
            </span>
            {step.flagged && (
              <span
                title={text.sentBack}
                className="absolute -right-1 bottom-2 text-xs text-orange-600"
              >
                ⚑
              </span>
            )}
          </button>
        ))}
      </div>
      {openStep && (
        <LiveStepDetail step={openStep} {...detail} text={text} onClose={() => setOpen(null)} />
      )}
    </div>
  );
};
