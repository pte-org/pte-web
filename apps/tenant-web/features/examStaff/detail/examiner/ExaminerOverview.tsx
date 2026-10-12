import type { ReactElement } from "react";
import type { ExaminerOverviewResponse } from "@pte/api-client";
import {
  CollapsibleSection,
  DashboardCard,
  EmptyState,
  StatCard,
  StatusDonutChart,
} from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { ExaminerProgress } from "./ExaminerProgress";

interface ExaminerOverviewProps { data: ExaminerOverviewResponse; text: StaffDetailText }

export const ExaminerOverview = ({ data, text }: ExaminerOverviewProps): ReactElement => {
  const metrics = [
    [text.totalSessions, data.totalSessions], [text.pendingSessions, data.totalByStatus.PENDING],
    [text.inProgressSessions, data.totalByStatus.IN_PROGRESS], [text.completedSessions, data.totalByStatus.COMPLETED],
  ] as const;
  const statusItems = [
    { key: "pending", label: text.pendingSessions, value: data.totalByStatus.PENDING, tone: "warning" as const },
    { key: "in-progress", label: text.inProgressSessions, value: data.totalByStatus.IN_PROGRESS, tone: "info" as const },
    { key: "completed", label: text.completedSessions, value: data.totalByStatus.COMPLETED, tone: "success" as const },
  ] as const;
  return <CollapsibleSection title={text.examinerOverview} subtitle={text.examinerOverviewDescription}>
    {!data.totalSessions ? <EmptyState title={text.noAssignments} /> : <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => <StatCard key={label} label={label} value={String(value)} />)}
      </div>
      <DashboardCard>
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">{text.statusBreakdown}</h3>
        <StatusDonutChart
          items={statusItems}
          totalLabel={text.totalSessions}
          emptyLabel={text.noAssignments}
          ariaLabel={text.statusBreakdown}
          className="mt-4"
        />
      </DashboardCard>
      <ExaminerProgress eligible={data.eligibleAnswerCount} submitted={data.submittedAnswerCount}
        percent={data.progressPercent} text={text} variant="circle" />
    </div>}
  </CollapsibleSection>;
};
