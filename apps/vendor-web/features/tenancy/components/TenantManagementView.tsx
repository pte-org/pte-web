"use client";

import { useState, type ReactElement } from "react";
import { PageHeader } from "@aptis/ui";
import { CREATE_TENANT_CONFLICT_TEXT, TENANCY_TEXT } from "../constants";
import { filterTenants } from "../utils/filterTenants";
import {
  useCreateTenant,
  useSuspendTenant,
  useTenants,
} from "../api";
import type {
  CreateTenantInput,
  Tenant,
  TenantCreationResult,
  TenantFilter,
} from "../types";
import { TenantFilters } from "./_TenantFilters";
import { TenantTable } from "./_TenantTable";
import { TenantEmptyState } from "./_TenantEmptyState";
import { SuspendTenantModal } from "./SuspendTenantModal";
import { CreateTenantModal } from "./CreateTenantModal";
import { TenantCreatedModal } from "./TenantCreatedModal";

const INITIAL_FILTER: TenantFilter = { query: "", status: "all" };
const SERVER_CONFLICT_MESSAGE = "Resource conflict";

function mutationErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;
  return error.message === SERVER_CONFLICT_MESSAGE
    ? CREATE_TENANT_CONFLICT_TEXT.CONFLICT
    : error.message;
}

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase();
}

function validateCreateConflict(
  input: CreateTenantInput,
  tenants: Tenant[],
): string | undefined {
  const slug = normalizeComparable(input.slug);
  const contactEmail = normalizeComparable(input.contactEmail);

  if (tenants.some((tenant) => normalizeComparable(tenant.slug) === slug)) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_SLUG;
  }

  if (
    tenants.some(
      (tenant) =>
        tenant.contactEmail !== null &&
        normalizeComparable(tenant.contactEmail) === contactEmail,
    )
  ) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_EMAIL;
  }

  return undefined;
}

export const TenantManagementView = (): ReactElement => {
  const { data: tenants } = useTenants();
  const suspend = useSuspendTenant();
  const create = useCreateTenant();

  const [filter, setFilter] = useState<TenantFilter>(INITIAL_FILTER);
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();
  const [createResult, setCreateResult] =
    useState<TenantCreationResult | null>(null);

  const visibleTenants = filterTenants(tenants ?? [], filter);

  const confirmSuspend = (tenant: Tenant): void => {
    suspend.mutate(tenant.id);
    setSuspendTarget(null);
  };

  const confirmCreate = (input: CreateTenantInput): void => {
    setCreateError(undefined);
    const conflictMessage = validateCreateConflict(input, tenants ?? []);
    if (conflictMessage) {
      setCreateError(conflictMessage);
      return;
    }

    create.mutate(input, {
      onSuccess: (result) => {
        setCreateOpen(false);
        setCreateError(undefined);
        setCreateResult(result);
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

      {visibleTenants.length > 0 ? (
        <TenantTable
          tenants={visibleTenants}
          onSuspend={setSuspendTarget}
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
        result={createResult}
        onClose={() => setCreateResult(null)}
      />
    </div>
  );
};
