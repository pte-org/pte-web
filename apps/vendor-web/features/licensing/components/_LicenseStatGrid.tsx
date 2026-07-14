import type { ReactElement } from "react";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  DocumentIcon,
  LicenseIcon,
  StatCard,
} from "@aptis/ui";
import { LICENSING_TEXT } from "../constants";
import type { LicenseStats } from "../types";

interface LicenseStatGridProps {
  stats?: LicenseStats;
}

export const LicenseStatGrid = ({
  stats,
}: LicenseStatGridProps): ReactElement => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      label={LICENSING_TEXT.STAT_TOTAL}
      value={stats?.total ?? "—"}
      icon={<DocumentIcon />}
    />
    <StatCard
      label={LICENSING_TEXT.STAT_ACTIVE}
      value={stats?.active ?? "—"}
      icon={<CheckCircleIcon />}
    />
    <StatCard
      label={LICENSING_TEXT.STAT_EXPIRING}
      value={stats?.expiring ?? "—"}
      icon={<AlertTriangleIcon />}
      highlight
    />
    <StatCard
      label={LICENSING_TEXT.STAT_EXPIRED}
      value={stats?.expired ?? "—"}
      icon={<LicenseIcon />}
    />
  </div>
);
