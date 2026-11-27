"use client";
import { useState } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";

interface AiReveal {
  revealed: boolean;
  revealNow: () => void;
}

/**
 * Blind marking: the AI score of a rubric answer stays hidden until every editable trait has a band, the answer
 * is already saved, or the examiner chooses to look early. Answers without a rubric show the AI at once.
 */
export function useAiReveal(answer: ExaminerAnswerDetailResponse | undefined,
  traitScores: Record<string, number | null> | undefined): AiReveal {
  const [forced, setForced] = useState<ReadonlySet<string>>(new Set());
  if (!answer) return { revealed: false, revealNow: () => undefined };
  const rubric = answer.rubric;
  // Every editable trait counts, machine-scored ones too: their default band is the AI's own score.
  const complete = Boolean(rubric?.traits.filter((trait) => trait.editable)
    .every((trait) => traitScores?.[trait.key] !== null && traitScores?.[trait.key] !== undefined));
  const saved = answer.myScore !== null || answer.decision !== null;
  return {
    revealed: !rubric || saved || complete || forced.has(answer.answerPublicId),
    revealNow: () => setForced((current) => new Set(current).add(answer.answerPublicId)),
  };
}
