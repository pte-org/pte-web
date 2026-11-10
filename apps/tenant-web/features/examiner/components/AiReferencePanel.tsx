"use client";

import type { ReactElement, ReactNode } from "react";
import type { ExaminerAiReferenceResponse } from "@pte/api-client";
import { Badge, Button, Disclosure } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface AiReferencePanelProps {
  detail?: ReactNode;
  reference: ExaminerAiReferenceResponse | null;
  readOnly: boolean;
  disabled?: boolean;
  onApplyAiScore: (score: number, version: string | null) => void;
  /** Trait key to its display name; keys without one are shown as they are. */
  traitLabels?: Record<string, string>;
  feedback?: string | null;
}

export const AiReferencePanel = ({
  reference,
  readOnly,
  disabled = false,
  onApplyAiScore,
  detail,
  traitLabels = {},
  feedback,
}: AiReferencePanelProps): ReactElement => {
  const T = useExaminerWorkText();
  if (!reference || reference.availability === "UNAVAILABLE") {
    return (
      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-xs text-slate-500">
        <h4 className="font-semibold text-slate-700">{T.AI_REFERENCE_TITLE}</h4>
        <p className="mt-1">{T.AI_STATUS_UNAVAILABLE}</p>
      </aside>
    );
  }

  if (reference.availability === "PENDING") {
    return (
      <aside className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm text-xs text-blue-800">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{T.AI_STATUS_PENDING}</Badge>
        </div>
      </aside>
    );
  }

  if (reference.availability === "FAILED") {
    return (
      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <Badge variant="warning">{T.AI_STATUS_FAILED}</Badge>
        </div>
      </aside>
    );
  }

  const hasScore = reference.score !== null;

  return (
    <aside className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm">
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
            onClick={() => { if (reference.score !== null) onApplyAiScore(reference.score, reference.version); }}
          >
            {T.USE_AI_SCORE}
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-indigo-950">{hasScore ? reference.score : "—"}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
        <dl className="flex flex-wrap gap-2">
          {Object.entries(reference.traitScores ?? {}).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5">
              <dt className="text-[11px] text-slate-500">{traitLabels[key] ?? key.replaceAll("_", " ")}</dt>
              <dd className="text-sm font-semibold tabular-nums text-indigo-950">
                {value}{reference.traitMaxima?.[key] !== undefined ? ` / ${reference.traitMaxima[key]}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {feedback && <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
      <Disclosure title={T.AI_DETAILS} className="mt-2">
        {detail}
      </Disclosure>
    </aside>
  );
};
