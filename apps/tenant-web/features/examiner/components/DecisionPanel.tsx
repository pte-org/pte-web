"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse, ScoreTraceResponse } from "@pte/api-client";
import { Alert, Button, Input, Textarea } from "@pte/ui";
import { getExaminerBlockingText, useExaminerWorkText } from "../hooks/useExaminerWorkText";
import { traitRequest } from "../traitDraft";
import { useTraitAutosave } from "../useTraitAutosave";
import { ExaminerTraitFields } from "./ExaminerTraitFields";
import { SavedExaminerDecision } from "./SavedExaminerDecision";
interface DecisionPanelProps {
  answer: ExaminerAnswerDetailResponse; draftScore: string; draftComment?: string; draftSavedAt?: string | null;
  traitScores?: Record<string, number | null>; itemScore?: number | null; scoreTrace?: ScoreTraceResponse | null; dirty?: boolean;
  carriedOver?: boolean; isStale: boolean; isMediaBroken?: boolean; isMediaLoading?: boolean; isSavingDraft?: boolean;
  onScoreChange: (score: string) => void; onTraitChange?: (key: string, value: number | null) => void;
  onCommentChange?: (comment: string) => void; onSaveDraft?: () => void; onAcknowledgeStale?: () => void;
}
export const DecisionPanel = ({ answer, draftScore, draftComment = "", draftSavedAt, traitScores = {}, itemScore, scoreTrace,
  dirty = false, carriedOver = false, isStale, isMediaBroken = false, isMediaLoading = false, isSavingDraft = false,
  onScoreChange, onTraitChange, onCommentChange, onSaveDraft, onAcknowledgeStale }: DecisionPanelProps): ReactElement => {
  const text = useExaminerWorkText();
  const saved = answer.myScore !== null || answer.decision !== null;
  const score = draftScore.trim() === "" ? Number.NaN : Number(draftScore);
  const valid = answer.rubric ? traitRequest(answer.rubric, traitScores) !== null : Number.isInteger(score) && score >= 0 && score <= 100;
  const machineReady = !answer.rubric || answer.rubric.traits.filter((trait) => trait.useAiWhenNull).every((trait) =>
    answer.aiReference?.availability === "AVAILABLE" && answer.aiReference.rubricVersionPublicId === answer.rubric?.rubricVersionPublicId && answer.aiReference.traitScores?.[trait.key] !== undefined);
  const disabled = !answer.canFinalize || isMediaBroken || isMediaLoading || isStale || isSavingDraft || !machineReady;
  const key = answer.rubric ? JSON.stringify([answer.answerPublicId, traitScores, draftComment]) : null;
  useTraitAutosave(key, Boolean(answer.rubric && dirty && valid && !disabled && !saved), onSaveDraft);
  if (saved) return <SavedExaminerDecision answer={answer} />;
  return <section className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
    {carriedOver && <Alert tone="warning" title={text.CARRIED_OVER_BADGE}>{text.CARRIED_OVER_HINT}</Alert>}
    {isStale && <Alert tone="warning" title={text.STALE_REFERENCE}><p>{text.STALE_REFERENCE_WARNING}</p>
      {onAcknowledgeStale && <Button size="sm" variant="secondary" onClick={onAcknowledgeStale}>{text.ACKNOWLEDGE_STALE}</Button>}</Alert>}
    {isMediaBroken && <Alert tone="error" title={text.MEDIA_UNAVAILABLE_TITLE}>{text.MEDIA_ERROR_WARNING}</Alert>}
    {!answer.canFinalize && <Alert tone="error" title={text.BLOCKED_FINALIZATION}>{answer.blockingReason ? getExaminerBlockingText(text, answer.blockingReason) : text.SUBMISSION_BLOCKED_FALLBACK}</Alert>}
    {answer.rubric ? <ExaminerTraitFields answer={answer} values={traitScores} itemScore={itemScore} trace={scoreTrace}
      disabled={disabled} onChange={onTraitChange} /> : <Input id="examiner-score-input" type="number" min={0} max={100} step={1}
      value={draftScore} disabled={disabled} onChange={(event) => onScoreChange(event.target.value)} placeholder={text.SCORE_PLACEHOLDER} />}
    {onCommentChange && <Textarea id="examiner-comment-input" label={text.COMMENT_LABEL} rows={2} maxLength={2000}
      value={draftComment} onChange={(event) => onCommentChange(event.target.value)} placeholder={text.COMMENT_PLACEHOLDER} />}
    {onSaveDraft && <Button variant="secondary" disabled={!valid || disabled} onClick={onSaveDraft}>{isSavingDraft ? text.SAVING_DRAFT : text.SAVE_DRAFT}</Button>}
    {draftSavedAt && <p className="text-xs text-slate-500">{text.DRAFT_SAVED}: {new Date(draftSavedAt).toLocaleTimeString()}</p>}
    {!answer.rubric && !valid && draftScore.length > 0 && <p className="text-xs text-red-600">{text.SCORE_INVALID}</p>}
  </section>;
};
