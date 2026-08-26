"use client";

import { useState, type ReactElement } from "react";
import { ApiError } from "@pte/api-client";
import { PageHeader } from "@pte/ui";
import { GRANT_QUOTA_TEXT, LICENSING_TEXT } from "../constants";
import { licenseStats, useGrantQuota, useLicenses } from "../api";
import type { GrantQuotaInput, License } from "../types";
import { LicenseStatGrid } from "./_LicenseStatGrid";
import { LicenseTable } from "./_LicenseTable";
import { GrantQuotaModal } from "./GrantQuotaModal";
import { QuotaHistoryModal } from "./QuotaHistoryModal";

function grantErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && error.kind === "conflict") {
    return GRANT_QUOTA_TEXT.CONFLICT;
  }
  return error instanceof Error ? error.message : undefined;
}

export const LicensingView = (): ReactElement => {
  const { data: licenses } = useLicenses();
  const [grantTarget, setGrantTarget] = useState<License | null>(null);
  const [historyTarget, setHistoryTarget] = useState<License | null>(null);

  const grantQuota = useGrantQuota(grantTarget?.tenantId ?? "");

  const confirmGrant = (input: GrantQuotaInput): void => {
    grantQuota.mutate(input, {
      onSuccess: () => setGrantTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={LICENSING_TEXT.TITLE}
        subtitle={LICENSING_TEXT.SUBTITLE}
        actions={
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {LICENSING_TEXT.EXPORT}
          </button>
        }
      />
      <LicenseStatGrid stats={licenses ? licenseStats(licenses) : undefined} />
      <LicenseTable
        licenses={licenses ?? []}
        onGrant={setGrantTarget}
        onViewHistory={setHistoryTarget}
      />

      <GrantQuotaModal
        key={grantTarget?.tenantId ?? "none"}
        open={grantTarget !== null}
        tenantName={grantTarget?.tenantName}
        onClose={() => {
          grantQuota.reset();
          setGrantTarget(null);
        }}
        onSubmit={confirmGrant}
        error={grantErrorMessage(grantQuota.error)}
        isSubmitting={grantQuota.isPending}
      />

      <QuotaHistoryModal
        tenantPublicId={historyTarget?.tenantId ?? null}
        tenantName={historyTarget?.tenantName}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
};
