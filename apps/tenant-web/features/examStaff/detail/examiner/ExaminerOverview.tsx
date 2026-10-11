import type { ReactElement } from "react";
import type { ExaminerOverviewResponse } from "@pte/api-client";
import { Alert, CollapsibleSection, DescriptionList, EmptyState, StatCard } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { ExaminerProgress } from "./ExaminerProgress";

interface ExaminerOverviewProps { data: ExaminerOverviewResponse; text: StaffDetailText }

export const ExaminerOverview = ({ data, text }: ExaminerOverviewProps): ReactElement => {
  const metrics = [
    [text.totalSessions, data.totalSessions], [text.pendingSessions, data.totalByStatus.PENDING],
    [text.inProgressSessions, data.totalByStatus.IN_PROGRESS], [text.completedSessions, data.totalByStatus.COMPLETED],
    [text.unavailableSessions, data.totalByStatus.UNAVAILABLE], [text.assignedAttempts, data.assignedAttemptCount],
    [text.batches, data.batchCount],
  ] as const;
  return <CollapsibleSection title={text.examinerOverview} subtitle={text.trackingDescription}>
    {!data.totalSessions ? <EmptyState title={text.noAssignments} /> : <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => <StatCard key={label} label={label} value={String(value)} />)}
      </div>
      {!data.progressCoverageComplete && <Alert tone="warning">{text.coverageIncomplete}</Alert>}
      <ExaminerProgress eligible={data.progressCoverageComplete ? data.eligibleAnswerCount : null}
        submitted={data.progressCoverageComplete ? data.submittedAnswerCount : null}
        percent={data.progressCoverageComplete ? data.progressPercent : null} text={text} />
      {!data.progressCoverageComplete && <DescriptionList items={[
        { label: text.verifiedEligible, value: data.verifiedEligibleAnswerCount },
        { label: text.verifiedSubmitted, value: data.verifiedSubmittedAnswerCount },
      ]} />}
      <DescriptionList items={[
        { label: text.pendingAttempts, value: data.pendingAttemptCount },
        { label: text.inProgressAttempts, value: data.inProgressAttemptCount },
        { label: text.completedAttempts, value: data.completedAttemptCount },
        { label: text.unavailableAttempts, value: data.unavailableAttemptCount },
      ]} />
    </div>}
  </CollapsibleSection>;
};
