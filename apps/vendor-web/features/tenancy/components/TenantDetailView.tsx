"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  Badge,
  CopyableId,
  DetailGroup,
  LoadingState,
  PageHeader,
  Tabs,
  useLocale,
} from "@pte/ui";
import {
  CREATE_LOGIN_ACCOUNT_TEXT,
  CREATE_TENANT_CONFLICT_TEXT,
  LOGIN_ACCOUNT_STATUS_LABELS,
  LOGIN_ACCOUNT_STATUS_VARIANT,
  LOGIN_ACCOUNT_TEXT,
  ORGANIZATION_TYPE_OPTIONS,
  TENANT_DETAIL_TEXT,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../constants";
import {
  useCreateLoginAccount,
  useLoginAccount,
  useOrganizations,
  useReactivateOrganization,
  useResetPassword,
  useSuspendOrganization,
  useTenant,
  useUpdateBranding,
} from "../api";
import type {
  BrandingInput,
  CreateLoginAccountInput,
  Organization,
  ResetPasswordInput,
} from "../types";
import { BrandingEditor } from "./BrandingEditor";
import { CreateLoginAccountModal } from "./CreateLoginAccountModal";
import { OrganizationTable } from "./_OrganizationTable";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { TenantEmptyState } from "./_TenantEmptyState";

const T = TENANT_DETAIL_TEXT;
const L = LOGIN_ACCOUNT_TEXT;

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

function mutationErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && error.kind === "conflict") {
    return getUserFacingApiErrorMessage(error, CREATE_TENANT_CONFLICT_TEXT.CONFLICT);
  }
  return getUserFacingApiErrorMessage(error);
}

function loginAccountErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && error.kind === "conflict") {
    return getUserFacingApiErrorMessage(error, CREATE_LOGIN_ACCOUNT_TEXT.CONFLICT);
  }
  return getUserFacingApiErrorMessage(error);
}

function resetPasswordErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && (error.kind === "network" || error.kind === "server")) {
    return LOGIN_ACCOUNT_TEXT.RESET_UNCERTAIN;
  }
  return mutationErrorMessage(error);
}

interface TenantDetailViewProps {
  tenantPublicId: string;
}

export const TenantDetailView = ({ tenantPublicId }: TenantDetailViewProps): ReactElement => {
  const tenantQuery = useTenant(tenantPublicId);
  const { data: tenant, isLoading } = tenantQuery;
  const { data: organizations } = useOrganizations(tenantPublicId);
  const loginAccountQuery = useLoginAccount(tenantPublicId);
  const loginAccount = loginAccountQuery.data?.account ?? null;
  const isAmbiguousLoginAccount = loginAccountQuery.data?.ambiguous ?? false;
  const updateBranding = useUpdateBranding(tenantPublicId);
  const suspendOrganization = useSuspendOrganization(tenantPublicId);
  const reactivateOrganization = useReactivateOrganization(tenantPublicId);
  const createLoginAccount = useCreateLoginAccount(tenantPublicId);
  const resetPassword = useResetPassword(loginAccount?.id ?? "");

  const [brandingSaved, setBrandingSaved] = useState(false);
  const [createLoginOpen, setCreateLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetSucceeded, setResetSucceeded] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");
  const { t } = useLocale();

  const confirmCreateLoginAccount = (input: CreateLoginAccountInput): void => {
    createLoginAccount.mutate(input, {
      onSuccess: () => setCreateLoginOpen(false),
    });
  };

  const confirmResetPassword = (input: ResetPasswordInput): void => {
    setResetSucceeded(false);
    resetPassword.mutate(input, {
      onSuccess: () => {
        setResetPasswordOpen(false);
        setResetSucceeded(true);
      },
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
        subtitle={T.SUMMARY_SUBTITLE(
          organizationTypeLabel(tenant.organizationType),
          TENANT_PLAN_LABELS[tenant.plan],
          tenant.seatsTotal,
        )}
      />

      <Tabs
        id="tenant-detail-tabs"
        value={activeSection}
        onChange={setActiveSection}
        items={[
          { id: "summary", label: t("tenant.tabs.summary", "Summary") },
          { id: "account", label: t("tenant.tabs.account", "Login account") },
          { id: "organizations", label: t("tenant.tabs.organizations", "Organizations") },
        ]}
      />

      <div
        role="tabpanel"
        id={`tenant-detail-tabs-panel-${activeSection}`}
        aria-labelledby={`tenant-detail-tabs-tab-${activeSection}`}
        tabIndex={0}
        className="flex flex-col gap-5 outline-none"
      >
      {activeSection === "summary" && <>
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
              label: T.ORGANIZATION_TYPE_LABEL,
              value: organizationTypeLabel(tenant.organizationType),
            },
            { label: T.TAX_CODE_LABEL, value: tenant.taxCode ?? T.EMPTY_VALUE, fullWidth: true },
          ]}
        />
        <DetailGroup
          title={T.GROUP_PLAN}
          items={[
            { label: T.PLAN_LABEL, value: TENANT_PLAN_LABELS[tenant.plan] },
            { label: T.STUDENT_LIMIT_LABEL, value: tenant.seatsTotal },
          ]}
        />
      </section>

      <BrandingEditor
        key={`${tenant.logoUrl ?? ""}|${tenant.primaryColor ?? ""}`}
        tenant={tenant}
        onSubmit={submitBranding}
        isSubmitting={updateBranding.isPending}
        error={mutationErrorMessage(updateBranding.error)}
        saved={brandingSaved}
      />
      </>}

      {activeSection === "account" && <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{L.TITLE}</h2>
          </div>
          {loginAccount && (
            <button
              type="button"
              onClick={() => setResetPasswordOpen(true)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {L.RESET_PASSWORD}
            </button>
          )}
        </div>

        {resetSucceeded && <Alert tone="success">{L.RESET_SUCCESS}</Alert>}

        {loginAccountQuery.isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">
            {L.LOADING}
          </div>
        ) : loginAccountQuery.error ? (
          <Alert tone="error">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loginAccountErrorMessage(loginAccountQuery.error) ?? L.LOAD_ERROR}</span>
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => void loginAccountQuery.refetch()}
              >
                {L.RETRY}
              </button>
            </div>
          </Alert>
        ) : isAmbiguousLoginAccount ? (
          <Alert tone="error">{L.AMBIGUOUS_TARGET}</Alert>
        ) : loginAccount ? (
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
            <DetailGroup
              title={L.GROUP_IDENTITY}
              items={[
                { label: L.USER_ID_LABEL, value: <CopyableId value={loginAccount.id} /> },
                { label: L.USERNAME_LABEL, value: loginAccount.username },
              ]}
            />
            <DetailGroup
              title={L.GROUP_ACCOUNT}
              items={[
                { label: L.EMAIL_LABEL, value: loginAccount.email },
                { label: L.FULL_NAME_LABEL, value: loginAccount.fullName },
                {
                  label: L.ROLES_LABEL,
                  value:
                    loginAccount.roles.length > 0 ? loginAccount.roles.join(", ") : L.EMPTY_VALUE,
                },
                {
                  label: T.STATUS_LABEL,
                  value: (
                    <Badge variant={LOGIN_ACCOUNT_STATUS_VARIANT[loginAccount.status]}>
                      {LOGIN_ACCOUNT_STATUS_LABELS[loginAccount.status]}
                    </Badge>
                  ),
                },
              ]}
            />
            <DetailGroup
              title={L.GROUP_STUDENT}
              items={[
                { label: L.STUDENT_CODE_LABEL, value: loginAccount.studentCode ?? L.EMPTY_VALUE },
                { label: L.CLASS_NAME_LABEL, value: loginAccount.className ?? L.EMPTY_VALUE },
                { label: L.PHONE_LABEL, value: loginAccount.phone ?? L.EMPTY_VALUE },
                { label: L.DATE_OF_BIRTH_LABEL, value: loginAccount.dateOfBirth ?? L.EMPTY_VALUE },
              ]}
            />
            <DetailGroup
              title={L.GROUP_SECURITY}
              items={[
                {
                  label: L.PASSWORD_STATE_LABEL,
                  value: loginAccount.mustChangePassword
                    ? L.PASSWORD_STATE_REQUIRED
                    : L.PASSWORD_STATE_NOT_REQUIRED,
                  fullWidth: true,
                },
              ]}
            />
          </div>
        ) : (
          <TenantEmptyState
            onAdd={() => setCreateLoginOpen(true)}
            title={L.EMPTY_TITLE}
            text={L.EMPTY_TEXT}
            addLabel={L.CREATE_LOGIN}
          />
        )}
      </section>}

      {activeSection === "organizations" && <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{T.ORGANIZATIONS_TITLE}</h2>
          </div>
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
          <TenantEmptyState title={T.EMPTY_ORGANIZATIONS_TITLE} text={T.EMPTY_ORGANIZATIONS_TEXT} />
        )}
      </section>}
      </div>

      <CreateLoginAccountModal
        key={createLoginOpen ? "createLoginAccount-open" : "createLoginAccount-closed"}
        open={createLoginOpen}
        onClose={() => {
          createLoginAccount.reset();
          setCreateLoginOpen(false);
        }}
        onSubmit={confirmCreateLoginAccount}
        error={loginAccountErrorMessage(createLoginAccount.error)}
        isSubmitting={createLoginAccount.isPending}
      />

      <ResetPasswordModal
        key={
          resetPasswordOpen
            ? `resetPassword-open-${loginAccount?.id ?? "unknown"}`
            : "resetPassword-closed"
        }
        open={resetPasswordOpen}
        onClose={() => {
          resetPassword.reset();
          setResetPasswordOpen(false);
        }}
        onSubmit={confirmResetPassword}
        error={resetPasswordErrorMessage(resetPassword.error)}
        isSubmitting={resetPassword.isPending}
        tenantName={tenant.name}
        targetName={loginAccount?.fullName ?? ""}
        targetUsername={loginAccount?.username ?? ""}
        targetRoles={loginAccount?.roles ?? []}
      />
    </div>
  );
};
