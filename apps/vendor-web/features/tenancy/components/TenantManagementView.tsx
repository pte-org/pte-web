"use client";

import { useState, type ReactElement } from "react";
import { ApiError } from "@pte/api-client";
import { Alert, PageHeader } from "@pte/ui";
import { CREATE_TENANT_CONFLICT_TEXT, TENANCY_TEXT } from "../constants";
import { filterTenants } from "../utils/filterTenants";
import {
  useCreateTenant,
  useReactivateTenant,
  useSuspendTenant,
  useTenants,
} from "../api";
import type { CreateTenantInput, Tenant, TenantFilter } from "../types";
import { TenantFilters } from "./_TenantFilters";
import { TenantTable } from "./_TenantTable";
import { TenantEmptyState } from "./_TenantEmptyState";
import { SuspendTenantModal } from "./SuspendTenantModal";
import { CreateTenantModal } from "./CreateTenantModal";
import { TenantCreatedModal } from "./TenantCreatedModal";

const INITIAL_FILTER: TenantFilter = { query: "", status: "all" };

function mutationErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.kind === "conflict") {
    return CREATE_TENANT_CONFLICT_TEXT.CONFLICT;
  }
  return error instanceof Error ? error.message : undefined;
}

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase();
}

function validateCreateConflict(
  input: CreateTenantInput,
  tenants: Tenant[],
): string | undefined {
  const name = normalizeComparable(input.name);

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

  const visibleTenants = filterTenants(tenants ?? [], filter);

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

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={TENANCY_TEXT.TITLE}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
          >
            + {TENANCY_TEXT.ADD_TENANT}
          </button>
        }
      />

      <TenantFilters filter={filter} onChange={setFilter} />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}

      {visibleTenants.length > 0 ? (
        <TenantTable
          tenants={visibleTenants}
          onSuspend={setSuspendTarget}
          onReactivate={confirmReactivate}
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

      <TenantCreatedModal
        tenant={createdTenant}
        onClose={() => setCreatedTenant(null)}
      />
    </div>
  );
};
