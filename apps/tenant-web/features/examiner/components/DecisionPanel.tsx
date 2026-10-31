"use client";

import type { ReactElement } from "react";
import type {
  ExaminerAnswerDetailResponse,
} from "@pte/api-client";
import { Alert, Badge, Button, Input } from "@pte/ui";
import { getExaminerBlockingText, useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface DecisionPanelProps {
  answer: ExaminerAnswerDetailResponse;
  draftScore: string;
  draftComment?: string;
  draftSavedAt?: string | null;
  /** The saved draft came from the previous Examiner and has not been confirmed yet. */
  carriedOver?: boolean;
  isStale: boolean;
  isMediaBroken?: boolean;
  isMediaLoading?: boolean;
  isSavingDraft?: boolean;
  onScoreChange: (score: string) => void;
  onCommentChange?: (comment: string) => void;
  onSaveDraft?: () => void;
  onAcknowledgeStale?: () => void;
}

export const DecisionPanel = ({
  answer,
  draftScore,
  draftComment = "",
  draftSavedAt,
  carriedOver = false,
  isStale,
  isMediaBroken = false,
  isMediaLoading = false,
  isSavingDraft = false,
  onScoreChange,
  onCommentChange,
  onSaveDraft,
  onAcknowledgeStale,
}: DecisionPanelProps): ReactElement => {
  const T = useExaminerWorkText();

  const hasSavedScore = answer.myScore !== null || answer.decision !== null;
  const parsedScore = draftScore.trim() === "" ? Number.NaN : Number(draftScore);
  const scoreIsValid =
    Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100;

  const aiScore = answer.aiReference?.score ?? null;
  const diff =
    scoreIsValid && typeof aiScore === "number" ? parsedScore - aiScore : null;

  if (hasSavedScore) {
    const decision = answer.decision;
    const kind = decision?.decisionKind ?? decision?.kind;
    return (
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="success">{T.STATUS_SAVED}</Badge>
          <span className="text-xs text-slate-500">{T.READ_ONLY}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-slate-900">
            {decision?.score ?? answer.myScore} / 100
          </span>
          <Badge variant="neutral">
            {kind === "CONFIRM_AI"
              ? T.DECISION_CONFIRM_AI
              : kind === "LEGACY_IMPORTED"
              ? T.DECISION_LEGACY
              : T.DECISION_MANUAL}
          </Badge>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {carriedOver && (
        <div className="mb-4">
          <Alert tone="warning" title={T.CARRIED_OVER_BADGE}>
            {T.CARRIED_OVER_HINT}
          </Alert>
        </div>
      )}
      {isStale && (
        <div className="mb-4">
          <Alert tone="warning" title={T.STALE_REFERENCE}>
            <div>
              <p>{T.STALE_REFERENCE_WARNING}</p>
              {onAcknowledgeStale && (
                <div className="mt-2">
                  <Button size="sm" variant="secondary" onClick={onAcknowledgeStale}>
                    {T.ACKNOWLEDGE_STALE}
                  </Button>
                </div>
              )}
            </div>
          </Alert>
        </div>
      )}

      {isMediaBroken && (
        <div className="mb-4">
          <Alert tone="error" title={T.MEDIA_UNAVAILABLE_TITLE}>
            {T.MEDIA_ERROR_WARNING}
          </Alert>
        </div>
      )}

      {!answer.canFinalize && (
        <div className="mb-4">
          <Alert tone="error" title={T.BLOCKED_FINALIZATION}>
            {answer.blockingReason
              ? getExaminerBlockingText(T, answer.blockingReason)
              : T.SUBMISSION_BLOCKED_FALLBACK}
          </Alert>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label htmlFor="examiner-score-input" className="block text-xs font-medium text-slate-700 mb-1">
              {T.SCORE_LABEL}
            </label>
            <Input
              id="examiner-score-input"
              type="number"
              min={0}
              max={100}
              step={1}
              value={draftScore}
              disabled={!answer.canFinalize || isMediaBroken || isMediaLoading}
              onChange={(e) => onScoreChange(e.target.value)}
              placeholder={T.SCORE_PLACEHOLDER}
            />
          </div>

          {diff !== null && (
            <span
              className={`pb-1 text-xs font-semibold ${
                diff > 0 ? "text-emerald-700" : diff < 0 ? "text-amber-700" : "text-slate-600"
              }`}
            >
              {T.DIFF_FROM_AI}: {diff > 0 ? `+${diff}` : diff}
            </span>
          )}

          {onSaveDraft && (
            <Button
              variant="secondary"
              disabled={!scoreIsValid || isSavingDraft}
              onClick={onSaveDraft}
            >
              {isSavingDraft ? T.SAVING_DRAFT : T.SAVE_DRAFT}
            </Button>
          )}
        </div>

        {onCommentChange && (
          <div>
            <label htmlFor="examiner-comment-input" className="block text-xs font-medium text-slate-700 mb-1">
              {T.COMMENT_LABEL}
            </label>
            <textarea
              id="examiner-comment-input"
              rows={2}
              maxLength={2000}
              value={draftComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder={T.COMMENT_PLACEHOLDER}
              className="w-full rounded-md border border-slate-300 p-2 text-xs focus:border-slate-800 focus:outline-none"
            />
          </div>
        )}

        {draftSavedAt && (
          <p className="text-xs text-slate-500">
            {T.DRAFT_SAVED}: {new Date(draftSavedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      {!scoreIsValid && draftScore.length > 0 && (
        <p className="mt-2 text-xs text-red-600">{T.SCORE_INVALID}</p>
      )}
    </section>
  );
};
