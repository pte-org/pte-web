"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  BuildingIcon,
  Button,
  Chip,
  DetailGroup,
  DocumentIcon,
  LoadingState,
  PackageIcon,
  type DescriptionItem,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { FACILITY_TYPE_LABELS, GRANT_TEXT } from "../constants";
import type { GrantLicenseFlow } from "../types";
import { formatContractDate } from "../utils";

interface GrantConfirmStepProps {
  flow: GrantLicenseFlow;
}

/** Final confirmation combines organization identity and the server-calculated grant. */
export const GrantConfirmStep = ({ flow }: GrantConfirmStepProps): ReactElement | null => {
  const T = useAdminCopy(GRANT_TEXT);
  const facilityLabels = useAdminCopy(FACILITY_TYPE_LABELS);
  const tenant = flow.tenant;
  if (!tenant) return null;
  const preview = flow.preview.data;
  if (flow.preview.isLoading || flow.preview.isFetching) return <LoadingState />;
  if (flow.preview.isError || !preview) {
    return (
      <Alert tone="error">
        <div className="flex items-center justify-between gap-3">
          <span>{getUserFacingApiErrorMessage(flow.preview.error, T.ERROR)}</span>
          <Button variant="ghost" onClick={() => void flow.preview.refetch()}>
            {T.RETRY}
          </Button>
        </div>
      </Alert>
    );
  }
  const address =
    [tenant.address, tenant.wardName, tenant.provinceName].filter(Boolean).join(", ") ||
    T.EMPTY_VALUE;
  const hosts =
    preview.hosts.length === 0
      ? T.NO_HOST
      : preview.hosts.map((host) => host.email ?? host.username).join(", ");
  const organizationItems: DescriptionItem[] = [
    { label: T.ORGANIZATION_NAME, value: <span className="break-words">{tenant.name}</span> },
    { label: T.ORGANIZATION_CODE, value: <Chip tone="sky">{tenant.code}</Chip> },
    { label: T.TAX_CODE, value: <span className="break-all">{tenant.taxCode ?? T.EMPTY_VALUE}</span> },
    { label: T.FACILITY_TYPE, value: facilityLabels[tenant.facilityType] },
    { label: T.ADDRESS, value: address, fullWidth: true },
    { label: T.HOSTS, value: <span className="break-all">{hosts}</span>, fullWidth: true },
  ];
  const packageItems: DescriptionItem[] = [
    {
      label: T.PLAN_LABEL,
      fullWidth: true,
      value: (
        <div className="break-words rounded-lg bg-[var(--sky-tint)] px-3 py-2 text-[var(--sky-action)]">
          {preview.planName ?? T.EMPTY_VALUE}
        </div>
      ),
    },
  ];
  if (flow.examPackage) {
    packageItems.push(
      {
        label: T.RUNS,
        fullWidth: true,
        value: (
          <Chip tone="sky">
            {formatContractDate(preview.startsAt)} – {formatContractDate(preview.expiresAt)}
          </Chip>
        ),
      },
      {
        label: T.MAX_STUDENTS,
        value: <Chip tone="mint">{preview.maxStudentsPerSession ?? T.EMPTY_VALUE}</Chip>,
      },
    );
    if (preview.renewsLicenseKey) {
      packageItems.push({
        label: T.CONTINUES,
        value: `${preview.renewsLicenseKey} · ${formatContractDate(preview.renewsExpiresAt)}`,
      });
    }
  } else {
    packageItems.push({
      label: T.SEATS_ADDED,
      value: <Chip tone="mint">{preview.extraStudentSlots ?? T.EMPTY_VALUE}</Chip>,
    });
  }
  const contractItems: DescriptionItem[] = [
    {
      label: T.CONTRACT_LABEL,
      value: (
        <div className="break-all rounded-lg bg-[var(--cream-tint)] px-3 py-2 text-[var(--cream-action)]">
          {flow.contractReference.trim()}
        </div>
      ),
    },
    {
      label: T.NOTE_LABEL,
      value: (
        <span className="whitespace-pre-wrap break-words">{flow.note.trim() || T.EMPTY_VALUE}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="info">{T.CONFIRM_HINT}</Alert>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-4">
          <DetailGroup
            title={T.GROUP_ORGANIZATION}
            icon={<BuildingIcon className="h-4 w-4" />}
            items={organizationItems}
          />
        </section>
        <section className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-4">
          <DetailGroup
            title={T.GROUP_PACKAGE}
            icon={<PackageIcon className="h-4 w-4" />}
            items={packageItems}
          />
        </section>
        <section className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4 lg:col-span-2">
          <DetailGroup
            title={T.GROUP_CONTRACT}
            icon={<DocumentIcon className="h-4 w-4" />}
            items={contractItems}
          />
        </section>
      </div>
      {!flow.examPackage && <Alert tone="warning">{T.CAPACITY_WARNING}</Alert>}
      {flow.grant.error != null && (
        <Alert tone="error">{getUserFacingApiErrorMessage(flow.grant.error, T.ERROR)}</Alert>
      )}
    </div>
  );
};
