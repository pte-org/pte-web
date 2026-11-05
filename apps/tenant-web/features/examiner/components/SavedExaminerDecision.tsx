"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
export function SavedExaminerDecision({ answer }: { answer: ExaminerAnswerDetailResponse }): ReactElement {
  const text = useExaminerWorkText();
  const decision = answer.decision;
  const kind = decision?.decisionKind ?? decision?.kind;
  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
    <Badge variant="success">{text.STATUS_SAVED}</Badge> <span className="text-xs">{text.READ_ONLY}</span>
    <p className="mt-3 text-2xl font-bold">{decision?.score ?? answer.myScore} / 100</p>
    <Badge variant="neutral">{kind === "CONFIRM_AI" ? text.DECISION_CONFIRM_AI : kind === "LEGACY_IMPORTED" ? text.DECISION_LEGACY : text.DECISION_MANUAL}</Badge>
    <ul className="mt-3 text-sm">{Object.entries(decision?.traitScores ?? {}).map(([key, value]) => <li key={key}>{key}: {value}</li>)}</ul>
  </section>;
}
