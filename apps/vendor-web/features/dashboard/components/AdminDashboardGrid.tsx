"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { DASHBOARD_GRID_CLASS } from "../constants";
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
  return (
    <div className="flex flex-col gap-6">
      {/* P1: KPI Row */}
      <AdminKpiRow dashboard={dashboard} />

      {/* Responsive Grid */}
      <div className={DASHBOARD_GRID_CLASS}>
        {/* Row 1: Attention + Growth */}
        <div className="flex flex-col md:col-span-2 xl:col-span-4">
          <AdminNeedsAttentionPanel dashboard={dashboard} onRetry={onRetry} className="h-full" />
        </div>
        <div className="flex flex-col md:col-span-2 xl:col-span-8">
          <TenantGrowthPanel section={dashboard.tenants} onRetry={onRetry} className="h-full" />
        </div>

        {/* Row 2: Status Donut + Org Type Donut + Map */}
        <div className="flex flex-col md:col-span-1 xl:col-span-4">
          <TenantStatusDonutPanel section={dashboard.tenants} onRetry={onRetry} className="h-full" />
        </div>
        <div className="flex flex-col md:col-span-1 xl:col-span-4">
          <TenantOrgTypeDonutPanel section={dashboard.tenants} onRetry={onRetry} className="h-full" />
        </div>
        <div className="flex flex-col md:col-span-2 xl:col-span-4">
          <VietnamTenantMapPanel className="h-full" />
        </div>

        {/* Row 3: Recent Tenants + Top Seat Utilisation */}
        <div className="flex flex-col md:col-span-2 xl:col-span-8">
          <RecentTenantsPanel
            section={dashboard.recentTenants}
            onRetry={onRetry}
            onViewTenant={onViewTenant}
            className="h-full"
          />
        </div>
        <div className="flex flex-col md:col-span-2 xl:col-span-4">
          <SeatUtilisationPanel section={dashboard.learners} onRetry={onRetry} className="h-full" />
        </div>

        {/* Row 4: Oldest Applications + Oldest Tickets */}
        <div className="flex flex-col md:col-span-1 xl:col-span-6">
          <ApplicationsPanel section={dashboard.applications} onRetry={onRetry} className="h-full" />
        </div>
        <div className="flex flex-col md:col-span-1 xl:col-span-6">
          <SupportTicketsPanel section={dashboard.support} onRetry={onRetry} className="h-full" />
        </div>

        {/* Row 5: Commercial Cards */}
        <div className="md:col-span-2 xl:col-span-12">
          <CommercialCards dashboard={dashboard} onRetry={onRetry} />
        </div>

        {/* Row 6: Revenue */}
        <div className="md:col-span-2 xl:col-span-12">
          <RevenuePanel section={dashboard.revenue} onRetry={onRetry} />
        </div>

        {/* Row 7: Question Bank Health */}
        <div className="md:col-span-2 xl:col-span-12">
          <QuestionBankPanel section={dashboard.questionBank} onRetry={onRetry} />
        </div>
      </div>
    </div>
  );
};
