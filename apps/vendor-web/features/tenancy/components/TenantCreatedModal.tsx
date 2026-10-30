"use client";

import type { ReactElement } from "react";
import { Button, CheckCircleIcon, Modal } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  ORGANIZATION_TYPE_OPTIONS as RAW_ORGANIZATION_TYPE_OPTIONS,
  TENANT_CREATED_TEXT as RAW_TENANT_CREATED_TEXT,
} from "../constants";
import type { Tenant } from "../types";

interface TenantCreatedModalProps {
  /** The newly created tenant; `null` keeps the modal closed. */
  tenant: Tenant | null;
  /** Where the first host's credentials were emailed. */
  hostEmail: string;
  onClose: () => void;
  /** Opens the package grant wizard for this tenant; a new tenant has no exam package yet. */
  onGrantPackage: (tenant: Tenant) => void;
}

const DetailRow = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div className="flex items-center justify-between border-t border-gray-100 py-2 first:border-t-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export const TenantCreatedModal = ({
  tenant,
  hostEmail,
  onClose,
  onGrantPackage,
}: TenantCreatedModalProps): ReactElement => {
  const T = useAdminCopy(RAW_TENANT_CREATED_TEXT);
  const organizationTypeOptions = useAdminCopy(RAW_ORGANIZATION_TYPE_OPTIONS);
  const organizationTypeLabel = (value: string): string =>
    organizationTypeOptions.find((option) => option.value === value)?.label ?? value;
  return (
    <Modal
      open={tenant !== null}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {T.CLOSE}
          </Button>
          <Button type="button" onClick={() => tenant && onGrantPackage(tenant)}>
            {T.GRANT_PACKAGE}
          </Button>
        </>
      }
    >
      {tenant && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">{T.TITLE}</h2>
            <p className="max-w-sm text-sm text-gray-500">{T.SUBTITLE}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <DetailRow label={T.CODE_LABEL} value={tenant.code} />
            <DetailRow label={T.NAME_LABEL} value={tenant.name} />
            <DetailRow
              label={T.ORG_TYPE_LABEL}
              value={organizationTypeLabel(tenant.organizationType)}
            />
            <DetailRow label={T.TAX_CODE_LABEL} value={tenant.taxCode ?? T.EMPTY_VALUE} />
            <DetailRow label={T.STUDENT_LIMIT_LABEL} value={String(tenant.seatsTotal)} />
            <DetailRow label={T.HOST_LABEL} value={hostEmail || T.EMPTY_VALUE} />
          </div>
          <p className="text-center text-xs text-gray-500">{T.HOST_NOTE}</p>
        </div>
      )}
    </Modal>
  );
};
