"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { StatusDonutChart } from "@pte/ui";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { buildOrgTypeDonutSlices, buildStatusDonutSlices } from "../utils/charts";
import { SectionPanel } from "./SectionPanel";

export interface TenantDistributionProps {
  section: AdminDashboardResponse["tenants"];
  onRetry: () => void;
  className?: string;
}

export const TenantStatusDonutPanel = ({
  section,
  onRetry,
  className,
}: TenantDistributionProps): ReactElement | null => {
  const { messages } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.statusDonutTitle}
      subtitle={messages.distributionSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => (
        <StatusDonutChart
          items={buildStatusDonutSlices(data, messages)}
          totalLabel={messages.statusDonutTotal}
          emptyLabel={messages.growthEmpty}
          ariaLabel={messages.statusDonutTitle}
        />
      )}
    </SectionPanel>
  );
};

export const TenantOrgTypeDonutPanel = ({
  section,
  onRetry,
  className,
}: TenantDistributionProps): ReactElement | null => {
  const { messages } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.orgTypeDonutTitle}
      subtitle={messages.distributionSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => (
        <StatusDonutChart
          items={buildOrgTypeDonutSlices(data.byOrganizationType, messages)}
          totalLabel={messages.orgTypeDonutTotal}
          emptyLabel={messages.growthEmpty}
          ariaLabel={messages.orgTypeDonutTitle}
        />
      )}
    </SectionPanel>
  );
};
