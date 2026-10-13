"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { ProgressBar } from "@pte/ui";
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
    >
      {(data) => {
        const rows = buildGradingRows(data);
        const hasBacklog = rows.some((row) => row.count > 0);
        return (
          <div className="flex flex-col gap-4">
            {hasBacklog ? (
              <ul className="flex flex-col gap-3">
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
              <p className="text-sm text-[var(--ink-secondary)]">{messages.gradingClear}</p>
            )}
            <dl className="grid grid-cols-1 gap-2 border-t border-[var(--shell-border)] pt-3 text-sm sm:grid-cols-2">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-[var(--ink-secondary)]">{messages.gradingAwaitingFinalisation}</dt>
                <dd className="font-semibold tabular-nums">
                  {formatNumber(data.closedSessionsAwaitingFinalisation, locale)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-[var(--ink-secondary)]">{messages.gradingReports}</dt>
                <dd className="font-semibold tabular-nums">
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
