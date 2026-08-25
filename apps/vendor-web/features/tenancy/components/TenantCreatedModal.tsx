"use client";

import type { ReactElement } from "react";
import { CheckCircleIcon, Modal } from "@aptis/ui";
import { ORGANIZATION_TYPE_OPTIONS, TENANT_CREATED_TEXT, TENANT_PLAN_LABELS } from "../constants";
import type { Tenant } from "../types";

interface TenantCreatedModalProps {
  /** The newly created tenant; `null` keeps the modal closed. */
  tenant: Tenant | null;
  onClose: () => void;
}

const T = TENANT_CREATED_TEXT;

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
  value;

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex items-center justify-between border-t border-gray-100 py-2 first:border-t-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export const TenantCreatedModal = ({
  tenant,
  onClose,
}: TenantCreatedModalProps): ReactElement => (
  <Modal
    open={tenant !== null}
    onClose={onClose}
    size="md"
    footer={
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
      >
        {T.CLOSE}
      </button>
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
          <DetailRow label={T.NAME_LABEL} value={tenant.name} />
          <DetailRow
            label={T.ORG_TYPE_LABEL}
            value={organizationTypeLabel(tenant.organizationType)}
          />
          <DetailRow label={T.PLAN_LABEL} value={TENANT_PLAN_LABELS[tenant.plan]} />
          <DetailRow
            label={T.STUDENT_LIMIT_LABEL}
            value={String(tenant.seatsTotal)}
          />
        </div>
      </div>
    )}
  </Modal>
);
