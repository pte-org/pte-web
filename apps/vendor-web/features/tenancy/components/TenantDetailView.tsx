"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { ApiError } from "@aptis/api-client";
import { Alert, Badge, LoadingState, PageHeader } from "@aptis/ui";
import {
  CREATE_TENANT_CONFLICT_TEXT,
  TENANT_DETAIL_TEXT,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../constants";
import {
  useCreateOrganization,
  useOrganizations,
  useReactivateOrganization,
  useSuspendOrganization,
  useTenant,
  useUpdateBranding,
} from "../api";
import type { BrandingInput, CreateOrganizationInput, Organization } from "../types";
import { BrandingEditor } from "./BrandingEditor";
import { OrganizationTable } from "./_OrganizationTable";
import { TenantEmptyState } from "./_TenantEmptyState";
import { CreateOrganizationModal } from "./CreateOrganizationModal";

const T = TENANT_DETAIL_TEXT;

function mutationErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.kind === "conflict") {
    return CREATE_TENANT_CONFLICT_TEXT.CONFLICT;
  }
  return error instanceof Error ? error.message : undefined;
}

interface TenantDetailViewProps {
  tenantPublicId: string;
}

export const TenantDetailView = ({ tenantPublicId }: TenantDetailViewProps): ReactElement => {
  const { data: tenant, isLoading } = useTenant(tenantPublicId);
  const { data: organizations } = useOrganizations(tenantPublicId);
  const updateBranding = useUpdateBranding(tenantPublicId);
  const createOrganization = useCreateOrganization(tenantPublicId);
  const suspendOrganization = useSuspendOrganization(tenantPublicId);
  const reactivateOrganization = useReactivateOrganization(tenantPublicId);

  const [createOpen, setCreateOpen] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);

  const confirmCreateOrganization = (input: CreateOrganizationInput): void => {
    createOrganization.mutate(input, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const confirmSuspendOrganization = (organization: Organization): void => {
    suspendOrganization.mutate(organization.id);
  };

  const confirmReactivateOrganization = (organization: Organization): void => {
    reactivateOrganization.mutate(organization.id);
  };

  const submitBranding = (input: BrandingInput): void => {
    setBrandingSaved(false);
    updateBranding.mutate(input, {
      onSuccess: () => setBrandingSaved(true),
    });
  };

  if (isLoading || !tenant) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/tenants" className="text-sm font-medium text-blue-700 hover:underline">
        &larr; {T.BACK_TO_TENANTS}
      </Link>

      <PageHeader
        title={tenant.name}
        actions={
          <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
            {TENANT_STATUS_LABELS[tenant.status]}
          </Badge>
        }
        subtitle={`${tenant.organizationType} · ${TENANT_PLAN_LABELS[tenant.plan]} · ${tenant.seatsTotal} students`}
      />

      <BrandingEditor
        key={`${tenant.logoUrl ?? ""}|${tenant.primaryColor ?? ""}`}
        tenant={tenant}
        onSubmit={submitBranding}
        isSubmitting={updateBranding.isPending}
        error={mutationErrorMessage(updateBranding.error)}
        saved={brandingSaved}
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{T.ORGANIZATIONS_TITLE}</h2>
            <p className="text-sm text-gray-500">{T.ORGANIZATIONS_SUBTITLE}</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
          >
            + {T.ADD_ORGANIZATION}
          </button>
        </div>

        {suspendOrganization.error || reactivateOrganization.error ? (
          <Alert tone="error">
            {mutationErrorMessage(suspendOrganization.error ?? reactivateOrganization.error)}
          </Alert>
        ) : null}

        {organizations && organizations.length > 0 ? (
          <OrganizationTable
            organizations={organizations}
            onSuspend={confirmSuspendOrganization}
            onReactivate={confirmReactivateOrganization}
          />
        ) : (
          <TenantEmptyState
            onAdd={() => setCreateOpen(true)}
            title={T.EMPTY_ORGANIZATIONS_TITLE}
            text={T.EMPTY_ORGANIZATIONS_TEXT}
            addLabel={T.ADD_ORGANIZATION}
          />
        )}
      </section>

      <CreateOrganizationModal
        key={createOpen ? "open" : "closed"}
        open={createOpen}
        onClose={() => {
          createOrganization.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreateOrganization}
        error={mutationErrorMessage(createOrganization.error)}
        isSubmitting={createOrganization.isPending}
      />
    </div>
  );
};
