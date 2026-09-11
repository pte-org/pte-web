"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { PageHeader } from "@pte/ui";
import { DASHBOARD_TEXT } from "../constants";
import { useTenants } from "../../tenancy/api";
import type { Tenant } from "../../tenancy/types";
import type { AdminStats } from "../types";
import { SystemNoticeBanner } from "./_SystemNoticeBanner";
import { AdminStatGrid } from "./_AdminStatGrid";
import { RecentTenantsTable } from "./_RecentTenantsTable";
import { TenantDetailModal } from "./_TenantDetailModal";
import { VietnamTenantMap } from "./_VietnamTenantMap";

const RECENT_TENANT_LIMIT = 5;

export const OverviewView = (): ReactElement => {
  const { data: allTenants } = useTenants();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const tenants = allTenants ?? [];
  const recentTenants = tenants.slice(0, RECENT_TENANT_LIMIT);
  const activeLearners = tenants.reduce(
    (total, tenant) => total + tenant.seatsUsed,
    0,
  );
  const expiringSoon = tenants.filter(
    (tenant) => tenant.status === "expiring",
  ).length;
  const activeTenantsCount = tenants.filter((tenant) => tenant.status === "active").length;
  const totalSeats = tenants.reduce((total, tenant) => total + tenant.seatsTotal, 0);

  const stats: AdminStats = {
    totalTenants: String(tenants.length),
    totalTenantsTrend: "+12.5%",
    totalTenantsProgress: tenants.length > 0 ? (activeTenantsCount / tenants.length) * 100 : 0,
    activeLearners: String(activeLearners),
    activeLearnersTrend: "+8.2%",
    activeLearnersProgress: totalSeats > 0 ? (activeLearners / totalSeats) * 100 : 0,
    expiringSoon: String(expiringSoon),
    expiringSoonProgress: tenants.length > 0 ? (expiringSoon / tenants.length) * 100 : 0,
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={DASHBOARD_TEXT.GREETING}
        subtitle={DASHBOARD_TEXT.GREETING_SUBTITLE}
        actions={
          <Link
            href="/admin/tenants"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
          >
            + {DASHBOARD_TEXT.ADD_TENANT}
          </Link>
        }
      />
      <SystemNoticeBanner />
      <AdminStatGrid stats={stats} />
      <VietnamTenantMap tenants={tenants} />
      <RecentTenantsTable
        tenants={recentTenants}
        total={tenants.length}
        onViewTenant={setSelectedTenant}
      />
      <TenantDetailModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />
    </div>
  );
};
