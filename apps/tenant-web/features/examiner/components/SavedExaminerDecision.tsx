"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
import { ExaminerTraitFields } from "./ExaminerTraitFields";

interface SavedExaminerDecisionProps {
  answer: ExaminerAnswerDetailResponse;
  gapReasons?: Record<string, string>;
}

/** A submitted score, read only: the same trait board as while marking, with the AI bands shown beside it. */
export const SavedExaminerDecision = ({ answer, gapReasons }: SavedExaminerDecisionProps): ReactElement => {
  const text = useExaminerWorkText();
  const decision = answer.decision;
  const kind = decision?.decisionKind ?? decision?.kind;
  const score = decision?.score ?? answer.myScore;
  return <section className="mt-5 space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">{text.STATUS_SAVED}</Badge>
        <Badge variant="neutral">{kind === "CONFIRM_AI" ? text.DECISION_CONFIRM_AI : kind === "LEGACY_IMPORTED" ? text.DECISION_LEGACY : text.DECISION_MANUAL}</Badge>
        <span className="text-xs text-[var(--ink-muted)]">{text.READ_ONLY}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{score ?? "—"} <span className="text-base font-medium text-[var(--ink-muted)]">/ 100</span></p>
    </div>
    {answer.rubric && <ExaminerTraitFields answer={answer} values={decision?.traitScores ?? {}} itemScore={score}
      disabled readOnly aiRevealed gapReasons={gapReasons} />}
  </section>;
};
