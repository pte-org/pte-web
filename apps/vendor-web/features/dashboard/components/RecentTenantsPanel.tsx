"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse, DashboardRecentTenant } from "@pte/api-client";
import { Badge, Button, DataTable, type DataTableColumn } from "@pte/ui";
import { ADMIN_DASHBOARD_ROUTES, TENANT_STATUS_BADGE_VARIANT } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate, formatNumber, formatTenantStatus } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface RecentTenantsPanelProps {
  section: AdminDashboardResponse["recentTenants"];
  onRetry: () => void;
  onViewTenant: (tenantId: string) => void;
  className?: string;
}

export const RecentTenantsPanel = ({
  section,
  onRetry,
  onViewTenant,
  className,
}: RecentTenantsPanelProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();

  const columns: DataTableColumn<DashboardRecentTenant>[] = [
    {
      key: "name",
      header: messages.colTenantName,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[var(--ink-primary)]">{row.name}</span>
          <span className="block text-xs text-[var(--ink-muted)]">{row.code}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: messages.colPlan,
      cell: (row) => row.planName ?? messages.noPlan,
    },
    {
      key: "studentsSeats",
      header: messages.colStudentsSeats,
      cell: (row) =>
        format("studentsSeatsValue", {
          students: formatNumber(row.studentCount, locale),
          seats: row.seatLimit === 0 ? messages.unmeteredSeats : formatNumber(row.seatLimit, locale),
        }),
    },
    {
      key: "status",
      header: messages.colStatus,
      cell: (row) => (
        <Badge variant={TENANT_STATUS_BADGE_VARIANT[row.status] ?? "neutral"}>
          {formatTenantStatus(row.status, messages)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: messages.colCreatedAt,
      cell: (row) => formatDate(row.createdAt, locale),
    },
    {
      key: "actions",
      header: messages.colActions,
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => onViewTenant(row.tenantId)}>
          {messages.actionViewDetails}
        </Button>
      ),
    },
  ];

  return (
    <SectionPanel
      title={messages.recentTenantsTitle}
      subtitle={messages.recentTenantsSubtitle}
      actions={
        <Link
          href={ADMIN_DASHBOARD_ROUTES.tenants}
          className="text-xs font-semibold text-action hover:underline"
        >
          {messages.recentTenantsViewAll}
        </Link>
      }
      section={section}
      onRetry={onRetry}
      className={className}
      emptyWhen={(data) =>
        data.items.length === 0
          ? { title: messages.recentTenantsEmpty }
          : null
      }
    >
      {(data) => (
        <DataTable<DashboardRecentTenant>
          columns={columns}
          rows={data.items}
          getRowKey={(row) => row.tenantId}
        />
      )}
    </SectionPanel>
  );
};
