import type { ReactElement } from "react";
import type { ProctorOverviewResponse } from "@pte/api-client";
import { CollapsibleSection, DashboardCard, StatCard, StatusDonutChart } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface ProctorOverviewProps { data: ProctorOverviewResponse; text: StaffDetailText }

export const ProctorOverview = ({ data, text }: ProctorOverviewProps): ReactElement => {
  const metrics = [
    [text.totalAssignedSessions, data.totalAssignedSessions], [text.proctored, data.ended],
    [text.upcoming, data.upcoming], [text.ongoing, data.ongoing],
  ] as const;
  const statusItems = [
    { key: "upcoming", label: text.upcoming, value: data.upcoming, tone: "info" as const },
    { key: "ongoing", label: text.ongoing, value: data.ongoing, tone: "brand" as const },
    { key: "ended", label: text.proctored, value: data.ended, tone: "success" as const },
    {
      key: "attention",
      label: text.proctorNeedsAttention,
      value: data.cancelled + data.awaitingOpen + data.preparing + data.unscheduled,
      tone: "warning" as const,
    },
  ] as const;
  return <CollapsibleSection title={text.proctorOverview} subtitle={text.proctorOverviewDescription}>
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => <StatCard key={label} label={label} value={String(value)} />)}
      </div>
      <DashboardCard>
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">{text.statusBreakdown}</h3>
        <StatusDonutChart
          items={statusItems}
          totalLabel={text.totalAssignedSessions}
          emptyLabel={text.noAssignments}
          ariaLabel={text.statusBreakdown}
          className="mt-4"
        />
      </DashboardCard>
    </div>
  </CollapsibleSection>;
};
