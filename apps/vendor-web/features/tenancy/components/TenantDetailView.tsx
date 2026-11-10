"use client";

import { usePathname } from "next/navigation";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  Badge,
  CopyableId,
  DetailGroup,
  LoadingState,
  Tabs,
  useLocale,
  useDashboardBreadcrumbLabel,
  useRememberedState,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useCurrentUser } from "@/features/auth/api";
import { isPlatformAdmin } from "@/features/auth/permissions";
import {
  ORGANIZATION_TYPE_OPTIONS as RAW_ORGANIZATION_TYPE_OPTIONS,
  TENANT_DETAIL_TEXT as RAW_TENANT_DETAIL_TEXT,
  TENANT_STATUS_LABELS as RAW_TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../constants";
import { useTenant } from "../api";
import { TenantLoginAccountSection } from "./TenantLoginAccountSection";

interface TenantDetailViewProps {
  tenantPublicId: string;
}

export const TenantDetailView = ({ tenantPublicId }: TenantDetailViewProps): ReactElement => {
  const T = useAdminCopy(RAW_TENANT_DETAIL_TEXT);
  const organizationTypeOptions = useAdminCopy(RAW_ORGANIZATION_TYPE_OPTIONS);
  const tenantStatusLabels = useAdminCopy(RAW_TENANT_STATUS_LABELS);
  const organizationTypeLabel = (value: string): string =>
    organizationTypeOptions.find((option) => option.value === value)?.label ?? value;
  const { data: currentUser } = useCurrentUser();
  const canManageTenantAccount = isPlatformAdmin(currentUser?.roles);
  const tenantQuery = useTenant(tenantPublicId);
  const { data: tenant, isLoading } = tenantQuery;
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, tenant?.name);

  const [activeSection, setActiveSection] = useRememberedState<string>("section", "tenant");
  const { t } = useLocale();

  if (isLoading) {
    return <LoadingState />;
  }

  if (tenantQuery.error || !tenant) {
    return (
      <Alert tone="error">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{getUserFacingApiErrorMessage(tenantQuery.error, T.LOAD_ERROR)}</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void tenantQuery.refetch()}
          >
            {T.RETRY}
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-4 shadow-card">
      <Tabs
        id="tenant-detail-tabs"
        value={activeSection}
        onChange={setActiveSection}
        variant="default"
        items={[
          { id: "tenant", label: t("tenant.tabs.tenant", "Tenant information") },
          ...(canManageTenantAccount
            ? [
                { id: "admin", label: t("tenant.tabs.admin", "Administrator information") },
              ]
            : []),
        ]}
      />

      <div
        role="tabpanel"
        id={`tenant-detail-tabs-panel-${activeSection}`}
        aria-labelledby={`tenant-detail-tabs-tab-${activeSection}`}
        tabIndex={0}
        className="mt-5 flex flex-col gap-5 outline-none"
      >
        {activeSection === "tenant" && (
          <>
            <section className="flex flex-col gap-4 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
              <h2 className="text-base font-semibold text-gray-900">{T.INFORMATION_TITLE}</h2>
              <DetailGroup
                title={T.GROUP_IDENTITY}
                items={[
                  { label: T.ID_LABEL, value: <CopyableId value={tenant.id} /> },
                  { label: T.CODE_LABEL, value: <CopyableId value={tenant.code} /> },
                ]}
              />
              <DetailGroup
                title={T.GROUP_ORGANIZATION}
                items={[
                  { label: T.NAME_LABEL, value: tenant.name },
                  {
                    label: T.STATUS_LABEL,
                    value: (
                      <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
                        {tenantStatusLabels[tenant.status]}
                      </Badge>
                    ),
                  },
                  {
                    label: T.ORGANIZATION_TYPE_LABEL,
                    value: organizationTypeLabel(tenant.organizationType),
                  },
                  {
                    label: T.TAX_CODE_LABEL,
                    value: tenant.taxCode ?? T.EMPTY_VALUE,
                    fullWidth: true,
                  },
                ]}
              />
              <DetailGroup
                title={T.GROUP_PLAN}
                items={[
                  { label: T.STUDENT_LIMIT_LABEL, value: tenant.seatsTotal },
                ]}
              />
            </section>

          </>
        )}

        {activeSection === "admin" && canManageTenantAccount && (
          <TenantLoginAccountSection tenantPublicId={tenantPublicId} tenantName={tenant.name} />
        )}
      </div>
    </div>
  );
};
