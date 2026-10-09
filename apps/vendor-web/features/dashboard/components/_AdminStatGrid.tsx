import type { ReactElement } from "react";
import { AlertTriangleIcon, BuildingIcon, StatCard, UsersIcon } from "@pte/ui";
import { DASHBOARD_OVERVIEW_TEXT, DASHBOARD_TEXT as RAW_DASHBOARD_TEXT } from "../constants";
import type { AdminStats } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AdminStatGridProps {
  stats?: AdminStats;
}

function formatProgress(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${Math.round(value)}%`;
}

export const AdminStatGrid = ({ stats }: AdminStatGridProps): ReactElement => {
  const T = useAdminCopy(RAW_DASHBOARD_TEXT);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={T.STAT_TOTAL}
        value={stats?.totalTenants ?? DASHBOARD_OVERVIEW_TEXT.EMPTY_VALUE}
        trend={formatProgress(stats?.totalTenantsProgress)}
        progress={stats?.totalTenantsProgress}
        icon={<BuildingIcon />}
        accent="blue"
      />
      <StatCard
        label={T.STAT_LEARNERS}
        value={stats?.activeLearners ?? DASHBOARD_OVERVIEW_TEXT.EMPTY_VALUE}
        trend={formatProgress(stats?.activeLearnersProgress)}
        progress={stats?.activeLearnersProgress}
        trendPositive={false}
        icon={<UsersIcon />}
        accent="sky"
      />
      <StatCard
        label={T.STAT_EXPIRING}
        value={stats?.expiringSoon ?? DASHBOARD_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={T.STAT_EXPIRING_NOTE}
        trend={formatProgress(stats?.expiringSoonProgress)}
        progress={stats?.expiringSoonProgress}
        highlight
        icon={<AlertTriangleIcon />}
        accent="cream"
      />
    </div>
  );
};
