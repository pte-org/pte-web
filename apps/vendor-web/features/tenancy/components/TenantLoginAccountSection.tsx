"use client";

import { useState, type ReactElement } from "react";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, Badge, Button, CopyableId, DetailGroup, LoadingState, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  CREATE_LOGIN_ACCOUNT_TEXT as RAW_CREATE_LOGIN_ACCOUNT_TEXT,
  CREATE_TENANT_CONFLICT_TEXT as RAW_CREATE_TENANT_CONFLICT_TEXT,
  LOGIN_ACCOUNT_STATUS_LABELS as RAW_LOGIN_ACCOUNT_STATUS_LABELS,
  LOGIN_ACCOUNT_STATUS_VARIANT,
  LOGIN_ACCOUNT_TEXT as RAW_LOGIN_ACCOUNT_TEXT,
} from "../constants";
import { useCreateLoginAccount, useLoginAccount, useResetPassword } from "../api";
import type { CreateLoginAccountInput, ResetPasswordInput } from "../types";
import { CreateLoginAccountModal } from "./CreateLoginAccountModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { TenantEmptyState } from "./_TenantEmptyState";

interface TenantLoginAccountSectionProps {
  tenantPublicId: string;
  tenantName: string;
}

function accountErrorMessage(error: unknown, conflictMessage: string): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && error.kind === "conflict") {
    return getUserFacingApiErrorMessage(error, conflictMessage);
  }
  return getUserFacingApiErrorMessage(error);
}

function resetPasswordErrorMessage(
  error: unknown,
  uncertainMessage: string,
  conflictMessage: string,
): string | undefined {
  if (error instanceof ApiError && (error.kind === "network" || error.kind === "server")) {
    return uncertainMessage;
  }
  return accountErrorMessage(error, conflictMessage);
}

export const TenantLoginAccountSection = ({
  tenantPublicId,
  tenantName,
}: TenantLoginAccountSectionProps): ReactElement => {
  const T = useAdminCopy(RAW_LOGIN_ACCOUNT_TEXT);
  const createLoginText = useAdminCopy(RAW_CREATE_LOGIN_ACCOUNT_TEXT);
  const tenantConflictText = useAdminCopy(RAW_CREATE_TENANT_CONFLICT_TEXT);
  const loginAccountStatusLabels = useAdminCopy(RAW_LOGIN_ACCOUNT_STATUS_LABELS);
  const loginRoleLabels = useAdminCopy({
    HOST_ADMIN: "Host admin",
    PLATFORM_ADMIN: "Platform administrator",
    PLATFORM_MANAGER: "Platform manager",
    ACADEMIC_MANAGER: "Academic manager",
    ACADEMIC_STAFF: "Academic staff",
    EXAMINER: "Examiner",
    PROCTOR: "Proctor",
    STUDENT: "Student",
  });
  const loginAccountQuery = useLoginAccount(tenantPublicId, true);
  const loginAccount = loginAccountQuery.data?.account ?? null;
  const isAmbiguousLoginAccount = loginAccountQuery.data?.ambiguous ?? false;
  const createLoginAccount = useCreateLoginAccount(tenantPublicId);
  const resetPassword = useResetPassword(loginAccount?.id ?? "");
  const [createLoginOpen, setCreateLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const { showToast } = useToast();

  const confirmCreateLoginAccount = (input: CreateLoginAccountInput): void => {
    createLoginAccount.mutate(input, {
      onSuccess: () => setCreateLoginOpen(false),
    });
  };

  const confirmResetPassword = (input: ResetPasswordInput): void => {
    resetPassword.mutate(input, {
      onSuccess: () => {
        setResetPasswordOpen(false);
        showToast(T.RESET_SUCCESS, { tone: "success" });
      },
    });
  };

  return (
    <>
      <section className="flex flex-col gap-4 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">{T.TITLE}</h2>
          {loginAccount && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setResetPasswordOpen(true)}
            >
              {T.RESET_PASSWORD}
            </Button>
          )}
        </div>

        {loginAccountQuery.isLoading ? (
          <LoadingState rows={4} label={T.LOADING} />
        ) : loginAccountQuery.error ? (
          <Alert tone="error">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {accountErrorMessage(loginAccountQuery.error, createLoginText.CONFLICT) ??
                  T.LOAD_ERROR}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void loginAccountQuery.refetch()}
              >
                {T.RETRY}
              </Button>
            </div>
          </Alert>
        ) : isAmbiguousLoginAccount ? (
          <Alert tone="error">{T.AMBIGUOUS_TARGET}</Alert>
        ) : loginAccount ? (
          <>
            <DetailGroup
              title={T.GROUP_ACCOUNT}
              items={[
                { label: T.FULL_NAME_LABEL, value: loginAccount.fullName },
                { label: T.EMAIL_LABEL, value: loginAccount.email },
                { label: T.USERNAME_LABEL, value: loginAccount.username },
                {
                  label: T.ROLES_LABEL,
                  value:
                    loginAccount.roles.length > 0
                      ? loginAccount.roles
                          .map(
                            (role) => loginRoleLabels[role as keyof typeof loginRoleLabels] ?? role,
                          )
                          .join(", ")
                      : T.EMPTY_VALUE,
                },
                {
                  label: T.STATUS_LABEL,
                  value: (
                    <Badge variant={LOGIN_ACCOUNT_STATUS_VARIANT[loginAccount.status]}>
                      {loginAccountStatusLabels[loginAccount.status]}
                    </Badge>
                  ),
                },
              ]}
            />
            <DetailGroup
              title={T.GROUP_SECURITY}
              items={[
                {
                  label: T.PASSWORD_STATE_LABEL,
                  value: loginAccount.mustChangePassword
                    ? T.PASSWORD_STATE_REQUIRED
                    : T.PASSWORD_STATE_NOT_REQUIRED,
                  fullWidth: true,
                },
              ]}
            />
            <DetailGroup
              title={T.GROUP_TECHNICAL}
              items={[{ label: T.USER_ID_LABEL, value: <CopyableId value={loginAccount.id} /> }]}
            />
          </>
        ) : (
          <TenantEmptyState
            onAdd={() => setCreateLoginOpen(true)}
            title={T.EMPTY_TITLE}
            text={T.EMPTY_TEXT}
            addLabel={T.CREATE_LOGIN}
          />
        )}
      </section>

      <CreateLoginAccountModal
        key={createLoginOpen ? "createLoginAccount-open" : "createLoginAccount-closed"}
        open={createLoginOpen}
        onClose={() => {
          createLoginAccount.reset();
          setCreateLoginOpen(false);
        }}
        onSubmit={confirmCreateLoginAccount}
        error={accountErrorMessage(createLoginAccount.error, createLoginText.CONFLICT)}
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
        error={resetPasswordErrorMessage(
          resetPassword.error,
          T.RESET_UNCERTAIN,
          tenantConflictText.CONFLICT,
        )}
        isSubmitting={resetPassword.isPending}
        tenantName={tenantName}
        targetName={loginAccount?.fullName ?? ""}
        targetUsername={loginAccount?.username ?? ""}
        targetRoles={loginAccount?.roles ?? []}
      />
    </>
  );
};
