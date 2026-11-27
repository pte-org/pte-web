"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import type { QuestionGenerationBatchQuestion } from "@pte/api-client";
import { Button, Chip, cn, useLocale } from "@pte/ui";
import { LANE_TONES } from "../../questiongeneration/liveTones";
import { questionDetailHref } from "../../questiongeneration/liveConstants";
import { failureLabel } from "../../questiongeneration/utils/failureLabel";
import { taskTypeLabel } from "../../questiongeneration/utils/taskTypeLabel";
import type { BatchMessages } from "../messages/en";
import { slotAgent, slotState, type SlotAgent } from "../utils/batchResults";
import { QuestionPreview } from "./_QuestionPreview";

interface BatchQuestionCardProps {
  slot: QuestionGenerationBatchQuestion;
  /** Its number in the whole batch, from 1. */
  number: number;
  batchId: string;
  section: string | null;
  messages: BatchMessages;
  onWatch: (jobId: string) => void;
}

const AGENT_LANE = { GEN: "GENERATOR", REV: "REVIEWER", MEDIA: "AUDIO" } as const satisfies Record<
  SlotAgent,
  keyof typeof LANE_TONES
>;
const AGENT_TEXT = {
  GEN: "agentGEN",
  REV: "agentREV",
  MEDIA: "agentMEDIA",
} as const satisfies Record<SlotAgent, keyof BatchMessages>;
const LINK_BUTTON =
  "inline-flex items-center rounded-md bg-[var(--action)] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90";
const PREVIEW = "relative h-28 overflow-hidden border-b border-[var(--border-subtle)] px-3 py-2.5";

/**
 * One question slot of a batch: a saved question previewed as itself, a running one framed in its agent's colour, a
 * failed one with its reason, and one not started yet as an empty dashed frame.
 */
export const BatchQuestionCard = ({
  slot,
  number,
  batchId,
  section,
  messages,
  onWatch,
}: BatchQuestionCardProps): ReactElement => {
  const { locale } = useLocale();
  const state = slotState(slot);
  const agent = slotAgent(slot);
  const tone = agent ? LANE_TONES[AGENT_LANE[agent]] : null;
  const chips: ReactNode = (
    <div className="flex flex-wrap gap-1">
      <Chip size="sm">{taskTypeLabel(slot.taskType)}</Chip>
      {slot.cefrLevel && <Chip size="sm">{slot.cefrLevel}</Chip>}
      {section && <Chip size="sm">{taskTypeLabel(section)}</Chip>}
    </div>
  );
  const title = (
    <p className="text-xs text-[var(--ink-muted)]">
      {messages.questionN.replace("{n}", String(number))}
    </p>
  );
  const watch = (label: string, primary: boolean): ReactNode => (
    <Button
      type="button"
      size="sm"
      variant={primary ? "primary" : "secondary"}
      onClick={() => onWatch(slot.jobPublicId)}
    >
      {label}
    </Button>
  );

  if (state === "waiting" || state === "cancelled") {
    return (
      <div className="flex min-h-56 flex-col rounded-lg border border-dashed border-[var(--border-subtle)]">
        <div className="flex h-28 items-center justify-center border-b border-dashed border-[var(--border-subtle)] text-2xl text-[var(--ink-muted)]/40">
          ◌
        </div>
        <div className="space-y-2 p-3 opacity-60">
          {title}
          {chips}
          <p className="text-xs text-[var(--ink-muted)]">{messages.notStarted}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] transition-shadow hover:shadow-card",
        state === "failed" && "border-rose-500/40",
        tone && cn("border-transparent", tone.mark),
      )}
    >
      <div
        className={cn(PREVIEW, state === "failed" ? "bg-rose-500/5" : "bg-[var(--surface-subtle)]")}
      >
        {state === "failed" ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-rose-700">
            <b>{`✕ ${messages.notSaved}`}</b>
            {slot.failureCode && failureLabel(slot.failureCode, locale === "vi" ? "vi" : "en")}
          </div>
        ) : (
          <QuestionPreview slot={slot} messages={messages} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {title}
        {chips}
        {state === "saved" && (
          <p className="flex flex-wrap gap-x-3 text-xs text-[var(--ink-secondary)]">
            {slot.reviewPassed !== null && slot.reviewTotal !== null && (
              <span className="font-medium text-emerald-700">
                {`✓ ${messages.reviewPassed.replace("{passed}", String(slot.reviewPassed)).replace("{total}", String(slot.reviewTotal))}`}
              </span>
            )}
            {slot.words !== null && (
              <span>{messages.wordCount.replace("{n}", String(slot.words))}</span>
            )}
          </p>
        )}
        {agent && tone && (
          <p className={cn("flex items-center gap-1.5 text-xs font-semibold", tone.header)}>
            <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", tone.dot)} />
            {messages[AGENT_TEXT[agent]]}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-1.5">
          {state === "saved" && slot.questionPublicId && (
            <Link className={LINK_BUTTON} href={questionDetailHref(slot.questionPublicId, batchId)}>
              {messages.openQuestion}
            </Link>
          )}
          {state === "running"
            ? watch(messages.watchLive, true)
            : watch(messages.viewProcess, false)}
        </div>
      </div>
    </div>
  );
};
