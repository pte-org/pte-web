import type { ReactElement } from "react";
import { AlertTriangleIcon, CheckCircleIcon, CollapsibleSection, DocumentIcon, StatCard, UsersIcon } from "@pte/ui";
import { LICENSING_OVERVIEW_TEXT, LICENSING_TEXT } from "../constants";
import type { LicenseStats } from "../types";

interface LicenseStatGridProps {
  stats?: LicenseStats;
}

export const LicenseStatGrid = ({ stats }: LicenseStatGridProps): ReactElement => (
  <CollapsibleSection
    title={LICENSING_OVERVIEW_TEXT.TITLE}
    subtitle={LICENSING_OVERVIEW_TEXT.SUBTITLE}
    contentClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
  >
    <StatCard
      label={LICENSING_TEXT.STAT_TOTAL}
      value={stats?.total ?? LICENSING_TEXT.EMPTY_VALUE}
      icon={<DocumentIcon />}
    />
    <StatCard
      label={LICENSING_TEXT.STAT_ACTIVE}
      value={stats?.active ?? LICENSING_TEXT.EMPTY_VALUE}
      icon={<CheckCircleIcon />}
    />
    <StatCard
      label={LICENSING_TEXT.STAT_SUSPENDED}
      value={stats?.suspended ?? LICENSING_TEXT.EMPTY_VALUE}
      icon={<AlertTriangleIcon />}
      highlight
    />
    <StatCard
      label={LICENSING_TEXT.STAT_TOTAL_SEATS}
      value={stats?.totalSeats ?? LICENSING_TEXT.EMPTY_VALUE}
      icon={<UsersIcon />}
    />
  </CollapsibleSection>
);
