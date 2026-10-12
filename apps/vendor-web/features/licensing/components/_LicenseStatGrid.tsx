import type { ReactElement } from "react";
import { AlertTriangleIcon, CheckCircleIcon, DocumentIcon, StatCard, UsersIcon } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { LICENSING_TEXT as RAW_LICENSING_TEXT } from "../constants";
import type { LicenseStats } from "../types";

interface LicenseStatGridProps {
  stats?: LicenseStats;
}

export const LicenseStatGrid = ({ stats }: LicenseStatGridProps): ReactElement => {
  const T = useAdminCopy(RAW_LICENSING_TEXT);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={T.STAT_TOTAL}
        value={stats?.total ?? T.EMPTY_VALUE}
        icon={<DocumentIcon />}
      />
      <StatCard
        label={T.STAT_ACTIVE}
        value={stats?.active ?? T.EMPTY_VALUE}
        icon={<CheckCircleIcon />}
      />
      <StatCard
        label={T.STAT_SUSPENDED}
        value={stats?.suspended ?? T.EMPTY_VALUE}
        icon={<AlertTriangleIcon />}
        highlight
      />
      <StatCard
        label={T.STAT_TOTAL_SEATS}
        value={stats?.totalSeats ?? T.EMPTY_VALUE}
        icon={<UsersIcon />}
      />
    </div>
  );
};
