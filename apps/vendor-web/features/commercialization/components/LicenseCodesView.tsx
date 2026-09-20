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
import { ApiError, type LicenseCodeResponse } from "@pte/api-client";
import {
  useIssueLicenseCode,
  useLicenseCodesQuery,
  usePlansQuery,
  useRevokeLicenseCode,
} from "../api";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString() : "—";

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
  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? "License codes could not be loaded or saved."
        : isError
          ? "License codes could not be loaded or saved."
          : undefined;

  const issueCode = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!planId) return;
    const result = await issue.mutateAsync({
      planId,
      codeExpiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
    });
    setMessage(`License code ${result.code} issued.`);
    setPlanId("");
    setExpiresAt("");
  };

  const confirmRevoke = async (): Promise<void> => {
    if (!codeToRevoke) return;
    await revoke.mutateAsync({
      code: codeToRevoke.code,
      reason: "Revoked by platform administrator",
    });
    setMessage(`License code ${codeToRevoke.code} revoked.`);
    setCodeToRevoke(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="License codes" subtitle="Issue and track redeemable exam package codes." />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      <CommercialPanel title="Issue a code" subtitle="Codes are limited to an active exam package.">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end"
          onSubmit={(event) => void issueCode(event)}
        >
          <Select
            id="license-plan"
            label="Plan"
            placeholder="Select active exam package"
            options={activePlans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            required
          />
          <Input
            id="license-expires"
            label="Code expiry"
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
          <Button type="submit" isLoading={issue.isPending} disabled={!planId}>
            Issue code
          </Button>
        </form>
      </CommercialPanel>
      <CommercialPanel
        title="Issued codes"
        subtitle="Codes and status are loaded from the billing API."
      >
        <DataTable
          columns={[
            {
              key: "code",
              header: "Code",
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs font-semibold text-slate-900">{row.code}</span>
              ),
            },
            {
              key: "plan",
              header: "Plan ID",
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs">{row.planId}</span>
              ),
            },
            {
              key: "issued",
              header: "Issued",
              cell: (row: LicenseCodeResponse) => formatDate(row.issuedAt),
            },
            {
              key: "expires",
              header: "Expires",
              cell: (row: LicenseCodeResponse) => formatDate(row.codeExpiresAt),
            },
            {
              key: "status",
              header: "Status",
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
                    label: "Revoke",
                    icon: BanIcon,
                    danger: true,
                    onSelect: () => setCodeToRevoke(row),
                  },
                ]}
              />
            ) : null
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? "Loading codes..." : "No license codes found"}
        />
      </CommercialPanel>
      <ConfirmDialog
        open={codeToRevoke !== null}
        title="Revoke license code?"
        description="This code will no longer be redeemable. The action cannot be undone."
        confirmLabel="Revoke code"
        tone="danger"
        isConfirming={revoke.isPending}
        onConfirm={() => void confirmRevoke()}
        onClose={() => setCodeToRevoke(null)}
      />
    </div>
  );
};
