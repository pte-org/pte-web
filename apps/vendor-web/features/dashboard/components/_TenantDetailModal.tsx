import type { ReactElement } from "react";
import { Badge, Button, Modal } from "@pte/ui";
import {
  TENANT_LOCATION_OPTIONS,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../../tenancy/constants";
import type { Tenant } from "../../tenancy/types";
import { DASHBOARD_TENANT_DETAIL_TEXT } from "../constants";

interface TenantDetailModalProps {
  tenant: Tenant | null;
  onClose: () => void;
}

interface DetailItemProps {
  label: string;
  value: string | ReactElement;
}

const DETAIL_GRID_CLASS = "grid gap-4 md:grid-cols-2";
const DETAIL_ITEM_CLASS = "rounded-lg border border-slate-100 bg-slate-50 p-4";

const getDisplayValue = (value: string | null): string =>
  value?.trim() || DASHBOARD_TENANT_DETAIL_TEXT.EMPTY_VALUE;

const getLocationLabel = (location: string | null): string => {
  const option = TENANT_LOCATION_OPTIONS.find((item) => item.value === location);
  return option?.label ?? getDisplayValue(location);
};

const DetailItem = ({ label, value }: DetailItemProps): ReactElement => (
  <div className={DETAIL_ITEM_CLASS}>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

export const TenantDetailModal = ({
  tenant,
  onClose,
}: TenantDetailModalProps): ReactElement => (
  <Modal
    open={tenant !== null}
    onClose={onClose}
    title={DASHBOARD_TENANT_DETAIL_TEXT.TITLE}
    size="xl"
    footer={
      <Button variant="secondary" onClick={onClose}>
        {DASHBOARD_TENANT_DETAIL_TEXT.CLOSE}
      </Button>
    }
  >
    {tenant && (
      <div className={DETAIL_GRID_CLASS}>
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.NAME}
          value={tenant.name}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.SLUG}
          value={tenant.slug}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.LOGIN_EMAIL}
          value={getDisplayValue(tenant.contactEmail)}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.PLAN}
          value={TENANT_PLAN_LABELS[tenant.plan]}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.STATUS}
          value={
            <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
              {TENANT_STATUS_LABELS[tenant.status]}
            </Badge>
          }
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.SEATS}
          value={`${tenant.seatsUsed} / ${tenant.seatsTotal}`}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.ACTIVATED}
          value={tenant.activatedAt}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.EXPIRES}
          value={tenant.expiresAt}
        />
        <DetailItem
          label={DASHBOARD_TENANT_DETAIL_TEXT.LOCATION}
          value={getLocationLabel(tenant.location)}
        />
      </div>
    )}
  </Modal>
);
