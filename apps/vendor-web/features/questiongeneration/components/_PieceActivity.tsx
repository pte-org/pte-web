"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationCheckStep, QuestionGenerationLiveCheck } from "@pte/api-client";
import { cn } from "@pte/ui";
import type { AssemblyText } from "../assemblyConstants";
import { CHECK_COPY } from "../liveCheckCopy";
import { REVIEW_CHECK_LABELS } from "../liveConstants";
import type { ActivePiece } from "../utils/livePieces";
import type { ReviewSummary } from "../utils/reviewSummary";
import { MakingMedia } from "./_MakingMedia";

interface PieceActivityProps {
  active: ActivePiece;
  checks: readonly QuestionGenerationLiveCheck[];
  review: ReviewSummary;
  locale: "vi" | "en";
  text: AssemblyText;
  /** The writer's draft, for the chart drawn while it is made. */
  typed: unknown;
}

/** The checks the validator runs on a written draft, in the order it runs them. */
const VALIDATE_STEPS: readonly QuestionGenerationCheckStep[] = ["JSON", "RULES", "DUPLICATE"];

type ChipState = "done" | "failed" | "pending";

/** One check; the first one still open is where the agent's cursor goes to tick it (`data-cursor-target`). */
const Chip = ({
  label,
  state,
  next,
}: {
  label: string;
  state: ChipState;
  next: boolean;
}): ReactElement => (
  <span
    data-cursor-target={next ? label : undefined}
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors duration-500",
      state === "done" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      state === "failed" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      state === "pending" && "bg-[var(--surface-subtle)] text-[var(--ink-muted)]",
      next && "ring-2 ring-[var(--action)]/30",
    )}
  >
    {state === "done" ? (
      "✓"
    ) : state === "failed" ? (
      "✕"
    ) : (
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    )}
    {label}
  </span>
);

const Heading = ({ children }: { children: string }): ReactElement => (
  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--ink-muted)]">
    <span className="flex gap-0.5">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="h-1 w-1 animate-bounce rounded-full bg-current" />
      ))}
    </span>
    {children}
  </p>
);

/**
 * What the agent on a piece is doing while nothing new is typed: the validator's checks or the reviewer's criteria
 * turning green one by one, or the media being made. Every state comes from the live feed.
 */
export const PieceActivity = ({
  active,
  checks,
  review,
  locale,
  text,
  typed,
}: PieceActivityProps): ReactElement | null => {
  if (active.phase === "media")
    return (
      <MakingMedia
        kind={active.key === "image" ? "image" : "audio"}
        typed={typed}
        text={text}
        replay={active.replay}
        mediaRef={active.mediaRef ?? null}
      />
    );
  if (active.phase === "validate") {
    const steps = CHECK_COPY[locale].steps;
    const stateOf = (step: QuestionGenerationCheckStep): ChipState => {
      const found = [...checks].reverse().find((check) => check.step === step);
      return found?.status === "PASSED"
        ? "done"
        : found?.status === "FAILED"
          ? "failed"
          : "pending";
    };
    return (
      <div>
        <Heading>{text.validating}</Heading>
        <div className="flex flex-wrap gap-1.5">
          {VALIDATE_STEPS.map((step) => (
            <Chip
              key={step}
              label={steps[step]}
              state={stateOf(step)}
              next={step === VALIDATE_STEPS.find((candidate) => stateOf(candidate) === "pending")}
            />
          ))}
        </div>
      </div>
    );
  }
  if (active.phase === "review") {
    const labels = REVIEW_CHECK_LABELS[locale];
    const stateOf = (key: string): ChipState => {
      const found = review.checks.find((check) => check.key === key);
      return found?.ok === true ? "done" : found?.ok === false ? "failed" : "pending";
    };
    return (
      <div>
        <Heading>{text.reviewing}</Heading>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(labels).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              state={stateOf(key)}
              next={
                key === Object.keys(labels).find((candidate) => stateOf(candidate) === "pending")
              }
            />
          ))}
        </div>
      </div>
    );
  }
  return null;
};
