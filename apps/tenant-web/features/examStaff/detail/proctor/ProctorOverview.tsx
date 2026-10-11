import type { ReactElement } from "react";
import type { ProctorOverviewResponse } from "@pte/api-client";
import { CollapsibleSection, StatCard } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface ProctorOverviewProps { data: ProctorOverviewResponse; text: StaffDetailText }

export const ProctorOverview = ({ data, text }: ProctorOverviewProps): ReactElement => {
  const metrics = [
    [text.totalAssignedSessions, data.totalAssignedSessions], [text.upcoming, data.upcoming],
    [text.ongoing, data.ongoing], [text.ended, data.ended], [text.cancelled, data.cancelled],
    [text.awaitingOpen, data.awaitingOpen], [text.preparing, data.preparing], [text.unscheduledCount, data.unscheduled],
  ] as const;
  return <CollapsibleSection title={text.proctorOverview} subtitle={text.scheduleDescription}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value]) => <StatCard key={label} label={label} value={String(value)} />)}
    </div>
  </CollapsibleSection>;
};
