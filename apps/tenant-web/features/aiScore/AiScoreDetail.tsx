import type { ReactElement } from "react";
import type { AiScoreDetailResponse } from "@pte/api-client";
import { Alert, Badge } from "@pte/ui";
import { AI_SCORE_STATUS_LABELS, AI_SCORE_STATUS_VARIANT, AI_SCORE_TEXT as T } from "./constants";
import { formatCriterion } from "./utils";

interface AiScoreDetailProps {
  ai: AiScoreDetailResponse;
}

const SectionTitle = ({ children }: { children: string }): ReactElement => (
  <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
    {children}
  </h4>
);

/**
 * The AI's estimate and why: status, score, criteria, feedback, speaking transcript and any
 * degraded-scoring notice. Shown to the host and to the assigned examiner only; never to students.
 */
export const AiScoreDetail = ({ ai }: AiScoreDetailProps): ReactElement => {
  const criteria = Object.entries(ai.criteria);
  const hasDetail = Object.keys(ai.detail).length > 0;

  return (
    <section
      aria-label={T.LABEL}
      className="flex flex-col gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-[var(--ink-primary)]">{T.LABEL}</span>
          <span className="text-lg font-semibold text-[var(--ink-primary)]">
            {ai.score === null ? T.NO_SCORE : ai.score}
          </span>
        </div>
        <Badge variant={AI_SCORE_STATUS_VARIANT[ai.status]}>
          {AI_SCORE_STATUS_LABELS[ai.status]}
        </Badge>
      </div>

      {ai.status === "FAILED" && (
        <Alert tone="error">
          {T.FAILURE_TITLE}
          {ai.failureReason ? ` · ${T.FAILURE_REASON(ai.failureReason)}` : ""}
        </Alert>
      )}
      {ai.fallback && <Alert tone="warning">{T.FALLBACK_NOTICE}</Alert>}

      {criteria.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <SectionTitle>{T.CRITERIA_TITLE}</SectionTitle>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {criteria.map(([name, value]) => (
              <li key={name} className="flex justify-between gap-3">
                <span className="text-[var(--ink-secondary)]">{formatCriterion(name)}</span>
                <span className="font-medium text-[var(--ink-primary)]">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ai.feedback && (
        <div className="flex flex-col gap-1">
          <SectionTitle>{T.FEEDBACK_TITLE}</SectionTitle>
          <p className="whitespace-pre-wrap text-sm text-[var(--ink-primary)]">{ai.feedback}</p>
        </div>
      )}

      {ai.transcript && (
        <div className="flex flex-col gap-1">
          <SectionTitle>{T.TRANSCRIPT_TITLE}</SectionTitle>
          <p className="whitespace-pre-wrap break-words text-sm text-[var(--ink-primary)]">
            {ai.transcript}
          </p>
        </div>
      )}

      {hasDetail && (
        <details className="text-sm">
          <summary className="cursor-pointer text-[var(--ink-secondary)]">{T.DETAIL_TITLE}</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-[var(--surface-card)] p-3 text-xs">
            {JSON.stringify(ai.detail, null, 2)}
          </pre>
        </details>
      )}

      <p className="text-xs text-[var(--ink-muted)]">{T.DISCLAIMER}</p>
    </section>
  );
};
