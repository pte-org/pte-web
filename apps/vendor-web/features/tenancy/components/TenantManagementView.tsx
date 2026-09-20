"use client";

import { useState, type ReactElement } from "react";
import { ApiError } from "@pte/api-client";
import {
  Alert,
  AlertTriangleIcon,
  CheckCircleIcon,
  CollapsibleSection,
  DocumentIcon,
  PageHeader,
  StatCard,
  UsersIcon,
} from "@pte/ui";
import {
  CREATE_TENANT_CONFLICT_TEXT,
  TENANCY_TEXT,
  TENANT_STATS_TEXT,
} from "../constants";
import { filterTenants } from "../utils/filterTenants";
import { useCreateTenant, useReactivateTenant, useSuspendTenant, useTenants } from "../api";
import type { CreateTenantInput, Tenant, TenantFilter } from "../types";
import { useGrantQuota } from "../../licensing/api";
import { GrantQuotaModal } from "../../licensing/components/GrantQuotaModal";
import { QuotaHistoryModal } from "../../licensing/components/QuotaHistoryModal";
import { GRANT_QUOTA_TEXT } from "../../licensing/constants";
import type { GrantQuotaInput } from "../../licensing/types";
import { TenantFilters } from "./_TenantFilters";
import { TenantTable } from "./_TenantTable";
import { TenantEmptyState } from "./_TenantEmptyState";
import { SuspendTenantModal } from "./SuspendTenantModal";
import { CreateTenantModal } from "./CreateTenantModal";
import { TenantCreatedModal } from "./TenantCreatedModal";

const INITIAL_FILTER: TenantFilter = {
  query: "",
  status: "all",
  plan: "all",
  organizationType: "all",
  capacity: "all",
};

function mutationErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.kind === "conflict") {
    if (error.message === "TENANT_CODE_ALREADY_USED") {
      return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_CODE;
    }
    return CREATE_TENANT_CONFLICT_TEXT.TENANT_CONFLICT;
  }
  return error instanceof Error ? error.message : undefined;
}

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase();
}

function validateCreateConflict(input: CreateTenantInput, tenants: Tenant[]): string | undefined {
  const code = normalizeComparable(input.code);
  const name = normalizeComparable(input.name);

  if (tenants.some((tenant) => normalizeComparable(tenant.code) === code)) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_CODE;
  }
  if (tenants.some((tenant) => normalizeComparable(tenant.name) === name)) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_NAME;
  }

  return undefined;
}

export const TenantManagementView = (): ReactElement => {
  const { data: tenants } = useTenants();
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();
  const create = useCreateTenant();

  const [filter, setFilter] = useState<TenantFilter>(INITIAL_FILTER);
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const [lifecycleError, setLifecycleError] = useState<string | undefined>();
  const [grantTarget, setGrantTarget] = useState<Tenant | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Tenant | null>(null);
  const grantQuota = useGrantQuota(grantTarget?.id ?? "");

  const allTenants = tenants ?? [];
  const visibleTenants = filterTenants(allTenants, filter);
  const totalSeats = allTenants.reduce((total, tenant) => total + tenant.seatsTotal, 0);

  const confirmSuspend = (tenant: Tenant): void => {
    setLifecycleError(undefined);
    suspend.mutate(tenant.id, {
      onError: (error) => setLifecycleError(mutationErrorMessage(error)),
    });
    setSuspendTarget(null);
  };

  const confirmReactivate = (tenant: Tenant): void => {
    setLifecycleError(undefined);
    reactivate.mutate(tenant.id, {
      onError: (error) => setLifecycleError(mutationErrorMessage(error)),
    });
  };

  const confirmCreate = (input: CreateTenantInput): void => {
    setCreateError(undefined);
    const conflictMessage = validateCreateConflict(input, tenants ?? []);
    if (conflictMessage) {
      setCreateError(conflictMessage);
      return;
    }

    create.mutate(input, {
      onSuccess: (tenant) => {
        setCreateOpen(false);
        setCreateError(undefined);
        setCreatedTenant(tenant);
      },
    });
  };

  const confirmGrantQuota = (input: GrantQuotaInput): void => {
    if (!grantTarget) return;
    grantQuota.mutate(input, {
      onSuccess: () => {
        grantQuota.reset();
        setGrantTarget(null);
      },
    });
  };

  const quotaErrorMessage = (error: unknown): string | undefined => {
    if (error instanceof ApiError && error.kind === "conflict") {
      return GRANT_QUOTA_TEXT.CONFLICT;
    }
    return error instanceof Error ? error.message : undefined;
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={TENANCY_TEXT.TITLE}
        subtitle={TENANCY_TEXT.SUBTITLE}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover"
          >
            + {TENANCY_TEXT.ADD_TENANT}
          </button>
        }
      />

      <CollapsibleSection
        title="Tenant overview"
        subtitle="Tenant status and capacity at a glance."
        contentClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label={TENANT_STATS_TEXT.TOTAL}
          value={String(allTenants.length)}
          icon={<DocumentIcon />}
          accent="blue"
        />
        <StatCard
          label={TENANT_STATS_TEXT.ACTIVE}
          value={String(allTenants.filter((tenant) => tenant.status === "active").length)}
          icon={<CheckCircleIcon />}
          accent="mint"
        />
        <StatCard
          label={TENANT_STATS_TEXT.SUSPENDED}
          value={String(allTenants.filter((tenant) => tenant.status === "suspended").length)}
          icon={<AlertTriangleIcon />}
          accent="cream"
        />
        <StatCard
          label={TENANT_STATS_TEXT.STUDENT_SEATS}
          value={String(totalSeats)}
          icon={<UsersIcon />}
          accent="sky"
        />
      </CollapsibleSection>

      <TenantFilters filter={filter} onChange={setFilter} />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}

      {visibleTenants.length > 0 ? (
        <TenantTable
          tenants={visibleTenants}
          onSuspend={setSuspendTarget}
          onReactivate={confirmReactivate}
          onGrantQuota={setGrantTarget}
          onViewQuotaHistory={setHistoryTarget}
        />
      ) : (
        <TenantEmptyState onAdd={() => setCreateOpen(true)} />
      )}

      <SuspendTenantModal
        key={suspendTarget?.id ?? "none"}
        tenant={suspendTarget}
        onCancel={() => setSuspendTarget(null)}
        onConfirm={confirmSuspend}
      />

      <CreateTenantModal
        key={createOpen ? "open" : "closed"}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateError(undefined);
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        error={createError ?? mutationErrorMessage(create.error)}
        isSubmitting={create.isPending}
      />

      <TenantCreatedModal tenant={createdTenant} onClose={() => setCreatedTenant(null)} />

      <GrantQuotaModal
        key={grantTarget?.id ?? "grant-quota-closed"}
        open={grantTarget !== null}
        tenantName={grantTarget?.name}
        onClose={() => {
          grantQuota.reset();
          setGrantTarget(null);
        }}
        onSubmit={confirmGrantQuota}
        error={quotaErrorMessage(grantQuota.error)}
        isSubmitting={grantQuota.isPending}
      />

      <QuotaHistoryModal
        tenantPublicId={historyTarget?.id ?? null}
        tenantName={historyTarget?.name}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
};
