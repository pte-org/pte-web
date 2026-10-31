"use client";

import type { ReactElement } from "react";
import { Alert, DescriptionList, LoadingState } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { FACILITY_TYPE_LABELS, GRANT_TEXT } from "../constants";
import type { GrantLicenseFlow } from "../types";

interface GrantConfirmStepProps {
  flow: GrantLicenseFlow;
}

/** Step 2: show the organization as the admin compares it with the paper contract. */
export const GrantConfirmStep = ({ flow }: GrantConfirmStepProps): ReactElement | null => {
  const T = useAdminCopy(GRANT_TEXT);
  const facilityLabels = useAdminCopy(FACILITY_TYPE_LABELS);
  const tenant = flow.tenant;
  if (!tenant) return null;
  const address =
    [tenant.address, tenant.wardName, tenant.provinceName].filter(Boolean).join(", ") || T.EMPTY_VALUE;
  const hosts = flow.hostsLoading ? (
    <LoadingState />
  ) : flow.hosts.length === 0 ? (
    T.NO_HOST
  ) : (
    flow.hosts.map((host) => host.email ?? host.username).join(", ")
  );

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="info">{T.CONFIRM_HINT}</Alert>
      <DescriptionList
        items={[
          { label: T.ORGANIZATION_NAME, value: tenant.name },
          { label: T.ORGANIZATION_CODE, value: tenant.code },
          { label: T.TAX_CODE, value: <strong>{tenant.taxCode ?? T.EMPTY_VALUE}</strong> },
          { label: T.FACILITY_TYPE, value: facilityLabels[tenant.facilityType] },
          { label: T.ADDRESS, value: address, fullWidth: true },
          { label: T.HOSTS, value: hosts, fullWidth: true },
        ]}
      />
    </div>
  );
};
