import type { ReactElement } from "react";
import { AlertTriangleIcon, CheckCircleIcon, CollapsibleSection, DocumentIcon, StatCard, UsersIcon } from "@pte/ui";
import { LICENSING_TEXT } from "../constants";
import type { LicenseStats } from "../types";

interface LicenseStatGridProps {
  stats?: LicenseStats;
}

export const LicenseStatGrid = ({ stats }: LicenseStatGridProps): ReactElement => (
  <CollapsibleSection
    title="License overview"
    subtitle="Issued licenses and student capacity at a glance."
    contentClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
  >
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
      label={LICENSING_TEXT.STAT_SUSPENDED}
      value={stats?.suspended ?? "—"}
      icon={<AlertTriangleIcon />}
      highlight
    />
    <StatCard
      label={LICENSING_TEXT.STAT_TOTAL_SEATS}
      value={stats?.totalSeats ?? "—"}
      icon={<UsersIcon />}
    />
  </CollapsibleSection>
);
