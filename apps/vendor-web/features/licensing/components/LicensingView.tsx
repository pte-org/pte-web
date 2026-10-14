"use client";

import { useState, type ReactElement } from "react";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { PageHeader } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  GRANT_QUOTA_TEXT as RAW_GRANT_QUOTA_TEXT,
  LICENSING_TEXT as RAW_LICENSING_TEXT,
} from "../constants";
import { useGrantQuota, useLicenses } from "../api";
import type { GrantQuotaInput, License } from "../types";
import { LicenseTable } from "./_LicenseTable";
import { GrantQuotaModal } from "./GrantQuotaModal";
import { QuotaHistoryModal } from "./QuotaHistoryModal";

function grantErrorMessage(error: unknown, conflictMessage: string): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && error.kind === "conflict") {
    return getUserFacingApiErrorMessage(error, conflictMessage);
  }
  return getUserFacingApiErrorMessage(error);
}

export const LicensingView = (): ReactElement => {
  const T = useAdminCopy(RAW_LICENSING_TEXT);
  const grantText = useAdminCopy(RAW_GRANT_QUOTA_TEXT);
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
        title={T.TITLE}
        actions={
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {T.EXPORT}
          </button>
        }
      />
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
        error={grantErrorMessage(grantQuota.error, grantText.CONFLICT)}
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
