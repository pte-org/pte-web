"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { CheckCircleIcon, ClipboardIcon, DocumentIcon, ProgressBar } from "@pte/ui";
import { PERCENT_SCALE } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildGradingRows } from "../utils/charts";
import { formatNumber } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

interface GradingPipelinePanelProps {
  section: HostDashboardResponse["grading"];
  onRetry: () => void;
  className?: string;
}

/**
 * Where the unfinished answers are in the grading pipeline (waiting, AI scoring, failed), each as
 * a share of that backlog, plus the two follow-up counts that are not part of the backlog.
 */
export const GradingPipelinePanel = ({
  section,
  onRetry,
  className,
}: GradingPipelinePanelProps): ReactElement | null => {
  const { locale, messages, format } = useHostDashboardText();

  return (
    <SectionPanel
      title={messages.gradingTitle}
      subtitle={messages.gradingSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
      contentClassName="flex-1 flex flex-col justify-between gap-5"
    >
      {(data) => {
        const rows = buildGradingRows(data);
        const hasBacklog = rows.some((row) => row.count > 0);
        return (
          <div className="flex h-full flex-col justify-between gap-5">
            {hasBacklog ? (
              <ul className="flex flex-col gap-3 rounded-xl border border-[var(--shell-border)]/60 bg-[var(--surface-subtle)]/30 p-4">
                {rows.map((row) => (
                  <li key={row.key} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-[var(--ink-secondary)]">{messages[row.labelKey]}</span>
                      <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
                        {formatNumber(row.count, locale)}
                      </span>
                    </div>
                    <ProgressBar
                      value={row.share}
                      max={PERCENT_SCALE}
                      tone={row.tone}
                      label={format("gradingShareLabel", {
                        label: messages[row.labelKey],
                        share: format("gradingShare", { percent: row.share }),
                      })}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--surface-subtle)]/40 p-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-card)] text-emerald-600 shadow-2xs ring-1 ring-emerald-500/20 dark:text-emerald-400">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--ink-primary)]">{messages.gradingClear}</p>
              </div>
            )}
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)]/60 p-4 transition-colors hover:bg-[var(--surface-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-card)] text-[var(--ink-muted)] shadow-2xs">
                    <ClipboardIcon className="h-4 w-4" />
                  </span>
                  <dt className="text-xs font-medium text-[var(--ink-secondary)]">
                    {messages.gradingAwaitingFinalisation}
                  </dt>
                </div>
                <dd className="mt-3 text-2xl font-bold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.closedSessionsAwaitingFinalisation, locale)}
                </dd>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)]/60 p-4 transition-colors hover:bg-[var(--surface-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-card)] text-[var(--ink-muted)] shadow-2xs">
                    <DocumentIcon className="h-4 w-4" />
                  </span>
                  <dt className="text-xs font-medium text-[var(--ink-secondary)]">
                    {messages.gradingReports}
                  </dt>
                </div>
                <dd className="mt-3 text-2xl font-bold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.reportsAwaitingPublication, locale)}
                </dd>
              </div>
            </dl>
          </div>
        );
      }}
    </SectionPanel>
  );
};
