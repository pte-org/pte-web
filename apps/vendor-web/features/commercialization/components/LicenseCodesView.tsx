"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  PageHeader,
  Select,
} from "@pte/ui";
import { getUserFacingApiErrorMessage, type LicenseCodeResponse } from "@pte/api-client";
import {
  useIssueLicenseCode,
  useLicenseCodesQuery,
  usePlansQuery,
  useRevokeLicenseCode,
} from "../api";
import { LICENSE_CODES_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString() : T.EMPTY_VALUE;

export const LicenseCodesView = (): ReactElement => {
  const { data: codes = [], isLoading, isError } = useLicenseCodesQuery();
  const { data: plans = [] } = usePlansQuery();
  const issue = useIssueLicenseCode();
  const revoke = useRevokeLicenseCode();
  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [codeToRevoke, setCodeToRevoke] = useState<LicenseCodeResponse | null>(null);
  const [message, setMessage] = useState("");
  const activePlans = plans.filter(
    (plan) => plan.type === "EXAM_PACKAGE" && plan.status === "ACTIVE",
  );
  const error = issue.error ?? revoke.error;
  const errorMessage = error
    ? getUserFacingApiErrorMessage(error, T.ERROR)
    : isError
      ? T.ERROR
      : undefined;

  const issueCode = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!planId) return;
    const result = await issue.mutateAsync({
      planId,
      codeExpiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
    });
    setMessage(T.ISSUED_SUCCESS(result.code));
    setPlanId("");
    setExpiresAt("");
  };

  const confirmRevoke = async (): Promise<void> => {
    if (!codeToRevoke) return;
    await revoke.mutateAsync({
      code: codeToRevoke.code,
      reason: T.REVOKE_REASON,
    });
    setMessage(T.REVOKED_SUCCESS(codeToRevoke.code));
    setCodeToRevoke(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      <CommercialPanel title={T.ISSUE_TITLE} subtitle={T.ISSUE_SUBTITLE}>
        <form
          className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end"
          onSubmit={(event) => void issueCode(event)}
        >
          <Select
            id="license-plan"
            label={T.PLAN_LABEL}
            placeholder={T.PLAN_PLACEHOLDER}
            options={activePlans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            required
          />
          <Input
            id="license-expires"
            label={T.EXPIRY_LABEL}
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
          <Button type="submit" isLoading={issue.isPending} disabled={!planId}>
            {T.ISSUE}
          </Button>
        </form>
      </CommercialPanel>
      <CommercialPanel
        title={T.ISSUED_TITLE}
        subtitle={T.ISSUED_SUBTITLE}
      >
        <DataTable
          columns={[
            {
              key: "code",
              header: T.CODE,
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs font-semibold text-slate-900">{row.code}</span>
              ),
            },
            {
              key: "plan",
              header: T.PLAN_ID,
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs">{row.planId}</span>
              ),
            },
            {
              key: "issued",
              header: T.ISSUED,
              cell: (row: LicenseCodeResponse) => formatDate(row.issuedAt),
            },
            {
              key: "expires",
              header: T.EXPIRES,
              cell: (row: LicenseCodeResponse) => formatDate(row.codeExpiresAt),
            },
            {
              key: "status",
              header: T.STATUS,
              cell: (row: LicenseCodeResponse) => <CommercialStatusBadge status={row.status} />,
            },
          ]}
          rows={codes}
          getRowKey={(row) => row.publicId}
          rowActions={(row) =>
            row.status === "ISSUED" ? (
              <ActionMenu
                items={[
                  {
                    label: T.REVOKE,
                    icon: BanIcon,
                    danger: true,
                    onSelect: () => setCodeToRevoke(row),
                  },
                ]}
              />
            ) : null
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? T.LOADING : T.EMPTY}
        />
      </CommercialPanel>
      <ConfirmDialog
        open={codeToRevoke !== null}
        title={T.REVOKE_TITLE}
        description={T.REVOKE_DESCRIPTION}
        confirmLabel={T.REVOKE_CONFIRM}
        tone="danger"
        isConfirming={revoke.isPending}
        onConfirm={() => void confirmRevoke()}
        onClose={() => setCodeToRevoke(null)}
      />
    </div>
  );
};
