"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, DescriptionList, LoadingState, type DescriptionItem } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GRANT_TEXT } from "../constants";
import type { GrantLicenseFlow } from "../types";
import { formatContractDate } from "../utils";

interface GrantPreviewStepProps {
  flow: GrantLicenseFlow;
}

/** Step 4: what the grant will create, recomputed by the server for the chosen start. */
export const GrantPreviewStep = ({ flow }: GrantPreviewStepProps): ReactElement => {
  const T = useAdminCopy(GRANT_TEXT);
  const preview = flow.preview.data;
  if (flow.preview.isLoading) return <LoadingState />;
  if (flow.preview.isError || !preview) {
    return <Alert tone="error">{getUserFacingApiErrorMessage(flow.preview.error, T.ERROR)}</Alert>;
  }

  const items: DescriptionItem[] = [
    { label: T.ORGANIZATION_NAME, value: flow.tenant?.name ?? T.EMPTY_VALUE },
    { label: T.PLAN_LABEL, value: preview.planName ?? T.EMPTY_VALUE },
  ];
  if (flow.examPackage) {
    items.push(
      {
        label: T.RUNS,
        value: `${formatContractDate(preview.startsAt)} – ${formatContractDate(preview.expiresAt)}`,
      },
      { label: T.MAX_STUDENTS, value: preview.maxStudentsPerSession ?? T.EMPTY_VALUE },
    );
    if (preview.renewsLicenseKey) {
      items.push({
        label: T.CONTINUES,
        value: `${preview.renewsLicenseKey} · ${formatContractDate(preview.renewsExpiresAt)}`,
      });
    }
  } else {
    items.push({ label: T.SEATS_ADDED, value: preview.extraStudentSlots ?? T.EMPTY_VALUE });
  }
  items.push({ label: T.CONTRACT_LABEL, value: flow.contractReference.trim(), fullWidth: true });

  return (
    <div className="flex flex-col gap-4">
      <DescriptionList items={items} />
      {!flow.examPackage && <Alert tone="warning">{T.CAPACITY_WARNING}</Alert>}
      {flow.grant.error != null && (
        <Alert tone="error">{getUserFacingApiErrorMessage(flow.grant.error, T.ERROR)}</Alert>
      )}
    </div>
  );
};
