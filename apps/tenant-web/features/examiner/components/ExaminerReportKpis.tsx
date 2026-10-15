"use client";

import type { ReactElement } from "react";
import { StatCard } from "@pte/ui";
import type { ExaminerReportSummary } from "@pte/api-client";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

interface ExaminerReportKpisProps {
  summary?: ExaminerReportSummary;
}

export function ExaminerReportKpis({ summary }: ExaminerReportKpisProps): ReactElement {
  const text = useExaminerWorkspaceText();

  const finalized = summary?.finalizedCount ?? 0;
  const inProgress = summary?.inProgressCount ?? 0;
  const pending = summary?.pendingCount ?? 0;
  const total = summary?.totalAssignedCount ?? 0;
  const avgMins = summary?.avgGradingDurationMinutes != null
    ? `${summary.avgGradingDurationMinutes.toFixed(1)} ${text.minutesUnit}`
    : "—";
  const regrades = summary?.regradeCount ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard
        compact
        label={text.kpiFinalized}
        value={String(finalized)}
        accent="mint"
      />
      <StatCard
        compact
        label={text.kpiInProgress}
        value={String(inProgress)}
        accent="sky"
      />
      <StatCard
        compact
        label={text.kpiPending}
        value={String(pending)}
        accent="cream"
      />
      <StatCard
        compact
        label={text.kpiTotalAssigned}
        value={String(total)}
        accent="blue"
      />
      <StatCard
        compact
        label={text.kpiAvgDuration}
        value={avgMins}
        accent="mint"
      />
      <StatCard
        compact
        label={text.kpiRegrades}
        value={String(regrades)}
        accent="blush"
        highlight={regrades > 0}
      />
    </div>
  );
}
