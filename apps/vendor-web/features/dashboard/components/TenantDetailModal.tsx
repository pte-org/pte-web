"use client";

import type { ReactElement, ReactNode } from "react";
import { Badge, Button, Modal } from "@pte/ui";
import { useTenant } from "@/features/tenancy/api";
import { TENANT_LOCATION_OPTIONS } from "@/features/tenancy/constants";
import { TENANCY_STATUS_BADGE_VARIANT } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate, formatTenantStatus } from "../utils/format";

export interface TenantDetailModalProps {
  tenantId: string | null;
  onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: ReactNode }): ReactElement => (
  <div className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-muted)] p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
    <div className="mt-1 text-sm font-semibold text-[var(--ink-primary)]">{value}</div>
  </div>
);

export const TenantDetailModal = ({
  tenantId,
  onClose,
}: TenantDetailModalProps): ReactElement => {
  const { locale, messages } = useAdminDashboardText();
  const { data: tenant, isLoading } = useTenant(tenantId ?? "");

  const locationLabel = (location: string | null | undefined): string => {
    if (!location) return messages.dash;
    const option = TENANT_LOCATION_OPTIONS.find((item) => item.value === location);
    return option?.label ?? location;
  };

  return (
    <Modal
      open={Boolean(tenantId)}
      onClose={onClose}
      title={messages.tenantDetailTitle}
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {messages.tenantDetailClose}
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-[var(--ink-secondary)]">{messages.tenantDetailLoading}</p>
      ) : tenant ? (
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label={messages.colTenantName} value={tenant.name} />
          <DetailItem label={messages.tenantDetailSlug} value={tenant.slug} />
          <DetailItem label={messages.tenantDetailEmail} value={tenant.contactEmail || messages.dash} />
          <DetailItem label={messages.tenantDetailPlan} value={tenant.plan || messages.noPlan} />
          <DetailItem
            label={messages.tenantDetailStatus}
            value={
              <Badge variant={TENANCY_STATUS_BADGE_VARIANT[tenant.status] ?? "neutral"}>
                {formatTenantStatus(tenant.status, messages)}
              </Badge>
            }
          />
          <DetailItem
            label={messages.tenantDetailSeats}
            value={`${tenant.seatsUsed} / ${tenant.seatsTotal === 0 ? messages.unmeteredSeats : tenant.seatsTotal}`}
          />
          <DetailItem label={messages.tenantDetailActivated} value={formatDate(tenant.activatedAt, locale)} />
          <DetailItem label={messages.tenantDetailExpires} value={formatDate(tenant.expiresAt, locale)} />
          <DetailItem label={messages.mapTitle} value={locationLabel(tenant.location)} />
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-secondary)]">{messages.recentTenantsEmpty}</p>
      )}
    </Modal>
  );
};
