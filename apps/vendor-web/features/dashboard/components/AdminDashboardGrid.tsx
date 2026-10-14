"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { CollapsibleSection } from "@pte/ui";
import {
  DASHBOARD_GRID_CLASS,
  DASHBOARD_SINGLE_COLUMN_GRID_CLASS,
  DASHBOARD_TWO_COLUMN_GRID_CLASS,
} from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { sectionAvailability } from "../utils/sections";
import { AdminKpiRow } from "./AdminKpiRow";
import { AdminNeedsAttentionPanel } from "./AdminNeedsAttentionPanel";
import { ApplicationsPanel } from "./ApplicationsPanel";
import { CommercialCards } from "./CommercialCards";
import { QuestionBankPanel } from "./QuestionBankPanel";
import { RecentTenantsPanel } from "./RecentTenantsPanel";
import { RevenuePanel } from "./RevenuePanel";
import { SeatUtilisationPanel } from "./SeatUtilisationPanel";
import { SupportTicketsPanel } from "./SupportTicketsPanel";
import { TenantGrowthPanel } from "./TenantGrowthPanel";
import {
  TenantOrgTypeDonutPanel,
  TenantStatusDonutPanel,
} from "./TenantDistributionDonuts";
import { VietnamTenantMapPanel } from "./VietnamTenantMapPanel";

export interface AdminDashboardGridProps {
  dashboard: AdminDashboardResponse;
  onRetry: () => void;
  onViewTenant: (tenantId: string) => void;
}

export const AdminDashboardGrid = ({
  dashboard,
  onRetry,
  onViewTenant,
}: AdminDashboardGridProps): ReactElement => {
  const { messages } = useAdminDashboardText();
  const hasAttentionSources = [
    dashboard.applications,
    dashboard.subscriptions,
    dashboard.licenses,
    dashboard.support,
  ].some((section) => sectionAvailability(section) !== "forbidden");
  const hasTenantGrowth = sectionAvailability(dashboard.tenants) !== "forbidden";
  const hasRecentTenants = sectionAvailability(dashboard.recentTenants) !== "forbidden";
  const hasLearnerUtilisation = sectionAvailability(dashboard.learners) !== "forbidden";
  const hasTenantDistribution = sectionAvailability(dashboard.tenants) !== "forbidden";
  const hasApplications = sectionAvailability(dashboard.applications) !== "forbidden";
  const hasSupport = sectionAvailability(dashboard.support) !== "forbidden";
  const hasOperationalPair = hasAttentionSources && hasTenantGrowth;
  const operationalColumnClass = hasOperationalPair ? "xl:col-span-4" : "xl:col-span-12";
  const growthColumnClass = hasOperationalPair ? "xl:col-span-8" : "xl:col-span-12";
  const requestGridClass = hasApplications && hasSupport
    ? DASHBOARD_TWO_COLUMN_GRID_CLASS
    : DASHBOARD_SINGLE_COLUMN_GRID_CLASS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <AdminKpiRow dashboard={dashboard} />

        <div className={DASHBOARD_GRID_CLASS}>
          {hasAttentionSources && (
            <AdminNeedsAttentionPanel
              dashboard={dashboard}
              onRetry={onRetry}
              className={`h-full ${operationalColumnClass}`}
            />
          )}
          {hasTenantGrowth && (
            <TenantGrowthPanel
              section={dashboard.tenants}
              onRetry={onRetry}
              className={`h-full ${growthColumnClass}`}
            />
          )}
          {hasRecentTenants && (
            <RecentTenantsPanel
              section={dashboard.recentTenants}
              onRetry={onRetry}
              onViewTenant={onViewTenant}
              className="h-full xl:col-span-12"
            />
          )}
        </div>
      </div>

      <CollapsibleSection
        title={messages.analysisTitle}
        subtitle={messages.analysisSubtitle}
        defaultExpanded={false}
      >
        <div className="flex flex-col gap-5">
          {(hasLearnerUtilisation || hasTenantDistribution) && (
            <div className={DASHBOARD_TWO_COLUMN_GRID_CLASS}>
              {hasLearnerUtilisation && (
                <SeatUtilisationPanel
                  section={dashboard.learners}
                  onRetry={onRetry}
                  className="h-full md:col-span-2"
                />
              )}
              {hasTenantDistribution && (
                <>
                  <TenantStatusDonutPanel section={dashboard.tenants} onRetry={onRetry} className="h-full" />
                  <TenantOrgTypeDonutPanel section={dashboard.tenants} onRetry={onRetry} className="h-full" />
                </>
              )}
            </div>
          )}

          <VietnamTenantMapPanel className="h-full" />

          {(hasApplications || hasSupport) && (
            <div className={requestGridClass}>
              {hasApplications && (
                <ApplicationsPanel section={dashboard.applications} onRetry={onRetry} className="h-full" />
              )}
              {hasSupport && (
                <SupportTicketsPanel section={dashboard.support} onRetry={onRetry} className="h-full" />
              )}
            </div>
          )}

          <CommercialCards dashboard={dashboard} onRetry={onRetry} />
          <RevenuePanel section={dashboard.revenue} onRetry={onRetry} />
          <QuestionBankPanel section={dashboard.questionBank} onRetry={onRetry} />
        </div>
      </CollapsibleSection>
    </div>
  );
};
