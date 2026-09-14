import type { ReactElement } from "react";
import { AlertTriangleIcon, BuildingIcon, StatCard, UsersIcon } from "@pte/ui";
import { DASHBOARD_TEXT } from "../constants";
import type { AdminStats } from "../types";

interface AdminStatGridProps {
  stats?: AdminStats;
}

function formatProgress(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${Math.round(value)}%`;
}

export const AdminStatGrid = ({ stats }: AdminStatGridProps): ReactElement => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <StatCard
      label={DASHBOARD_TEXT.STAT_TOTAL}
      value={stats?.totalTenants ?? "-"}
      trend={formatProgress(stats?.totalTenantsProgress)}
      progress={stats?.totalTenantsProgress}
      icon={<BuildingIcon />}
      accent="blue"
    />
    <StatCard
      label={DASHBOARD_TEXT.STAT_LEARNERS}
      value={stats?.activeLearners ?? "-"}
      trend={formatProgress(stats?.activeLearnersProgress)}
      progress={stats?.activeLearnersProgress}
      trendPositive={false}
      icon={<UsersIcon />}
      accent="sky"
    />
    <StatCard
      label={DASHBOARD_TEXT.STAT_EXPIRING}
      value={stats?.expiringSoon ?? "-"}
      footnote={DASHBOARD_TEXT.STAT_EXPIRING_NOTE}
      trend={formatProgress(stats?.expiringSoonProgress)}
      progress={stats?.expiringSoonProgress}
      highlight
      icon={<AlertTriangleIcon />}
      accent="cream"
    />
  </div>
);
