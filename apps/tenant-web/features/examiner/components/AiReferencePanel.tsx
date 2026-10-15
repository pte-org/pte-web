"use client";

import type { ReactElement } from "react";
import type { ExaminerAiReferenceResponse } from "@pte/api-client";
import { Badge, Button } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

interface AiReferencePanelProps {
  reference: ExaminerAiReferenceResponse | null;
  readOnly: boolean;
  disabled?: boolean;
  onApplyAiScore: (score: number, version: string | null) => void;
}

export const AiReferencePanel = ({
  reference,
  readOnly,
  disabled = false,
  onApplyAiScore,
}: AiReferencePanelProps): ReactElement => {
  if (!reference || reference.availability === "UNAVAILABLE") {
    return (
      <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <h4 className="font-semibold text-slate-700">{T.AI_REFERENCE_TITLE}</h4>
        <p className="mt-1">{T.AI_STATUS_UNAVAILABLE}</p>
      </aside>
    );
  }

  if (reference.availability === "PENDING") {
    return (
      <aside className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-800">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{T.AI_STATUS_PENDING}</Badge>
        </div>
      </aside>
    );
  }

  if (reference.availability === "FAILED") {
    return (
      <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <Badge variant="warning">{T.AI_STATUS_FAILED}</Badge>
        </div>
      </aside>
    );
  }

  const hasScore = reference.score !== null;

  return (
    <aside className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-indigo-950">{T.AI_REFERENCE_TITLE}</h4>
          <Badge variant="success">{T.AI_STATUS_AVAILABLE}</Badge>
        </div>
        {hasScore && !readOnly && (
          <Button
            size="sm"
            variant="secondary"
            appearance="outline"
            disabled={disabled}
            onClick={() => onApplyAiScore(reference.score as number, reference.version)}
          >
            {T.USE_AI_SCORE}
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-4 text-sm">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-slate-500">{T.SCORE_LABEL_SHORT}</span>
          <span className="text-lg font-bold text-indigo-950">
            {hasScore ? `${reference.score}/100` : "—"}
          </span>
        </div>
        {reference.version && (
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500">{T.AI_REVISION_LABEL}</span>
            <span className="font-mono text-xs text-slate-700">{reference.version}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
