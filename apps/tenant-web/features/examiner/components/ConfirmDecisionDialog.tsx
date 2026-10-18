"use client";

import type { ReactElement } from "react";
import type { ExaminerDecisionKind } from "@pte/api-client";
import { Alert, Badge, ConfirmDialog } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface ConfirmDecisionDialogProps {
  open: boolean;
  isConfirming: boolean;
  isStale?: boolean;
  isMediaBroken?: boolean;
  score: number;
  decisionKind: ExaminerDecisionKind;
  taskTitle: string;
  requestPublicId: string;
  expectedReviewVersion?: string | null;
  aiScore?: number | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDecisionDialog = ({
  open,
  isConfirming,
  isStale = false,
  isMediaBroken = false,
  score,
  decisionKind,
  taskTitle,
  requestPublicId,
  expectedReviewVersion,
  aiScore,
  onConfirm,
  onClose,
}: ConfirmDecisionDialogProps): ReactElement => {
  const T = useExaminerWorkText();
  const isConfirmAi = decisionKind === "CONFIRM_AI";
  const diff = typeof aiScore === "number" ? score - aiScore : null;
  const isBlocked = isStale || isMediaBroken;

  const handleConfirm = (): void => {
    if (isBlocked) return;
    onConfirm();
  };

  return (
    <ConfirmDialog
      open={open}
      title={T.CONFIRM_TITLE}
      onClose={onClose}
      onConfirm={handleConfirm}
      isConfirming={isConfirming}
      confirmLabel={isConfirming ? T.SUBMITTING : isBlocked ? T.SUBMISSION_BLOCKED : T.CONFIRM_ACTION}
      cancelLabel={T.CANCEL}
      description={
        <div className="space-y-3 pt-2 text-sm text-slate-700">
          <p>{T.CONFIRM_DESCRIPTION}</p>
          {isBlocked && (
            <Alert tone="warning">
              {T.CONFIRM_INVALIDATED_WARNING}
            </Alert>
          )}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{T.TARGET_ANSWER}:</span>
              <span className="font-semibold text-slate-900">{taskTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{T.DECISION_KIND_LABEL}:</span>
              <Badge variant={isConfirmAi ? "neutral" : "info"}>
                {isConfirmAi ? T.DECISION_CONFIRM_AI : T.DECISION_MANUAL}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{T.PROPOSED_SCORE}</span>
              <span className="font-bold text-base text-slate-900">{score} / 100</span>
            </div>
            {diff !== null && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{T.DIFF_FROM_AI}:</span>
                <span
                  className={`font-semibold ${
                    diff > 0 ? "text-emerald-700" : diff < 0 ? "text-amber-700" : "text-slate-600"
                  }`}
                >
                  {diff > 0 ? `+${diff}` : String(diff)}
                </span>
              </div>
            )}
            {expectedReviewVersion && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{T.EXPECTED_VERSION}:</span>
                <span className="font-mono text-slate-600">{expectedReviewVersion}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{T.REQUEST_ID}:</span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
                {requestPublicId}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
};
