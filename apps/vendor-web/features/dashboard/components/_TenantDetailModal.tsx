import type { ReactElement } from "react";
import { Badge, Button, Modal } from "@pte/ui";
import {
  TENANT_LOCATION_OPTIONS,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../../tenancy/constants";
import type { Tenant } from "../../tenancy/types";
import { DASHBOARD_TENANT_DETAIL_TEXT as RAW_DASHBOARD_TENANT_DETAIL_TEXT } from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

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

const getDisplayValue = (value: string | null): string => value?.trim() || "—";

const getLocationLabel = (location: string | null): string => {
  const option = TENANT_LOCATION_OPTIONS.find((item) => item.value === location);
  return option?.label ?? getDisplayValue(location);
};

const DetailItem = ({ label, value }: DetailItemProps): ReactElement => (
  <div className={DETAIL_ITEM_CLASS}>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

export const TenantDetailModal = ({ tenant, onClose }: TenantDetailModalProps): ReactElement => {
  const T = useAdminCopy(RAW_DASHBOARD_TENANT_DETAIL_TEXT);
  const planLabels = useAdminCopy(TENANT_PLAN_LABELS);
  const statusLabels = useAdminCopy(TENANT_STATUS_LABELS);

  return (
    <Modal
      open={tenant !== null}
      onClose={onClose}
      title={T.TITLE}
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {T.CLOSE}
        </Button>
      }
    >
      {tenant && (
        <div className={DETAIL_GRID_CLASS}>
          <DetailItem label={T.NAME} value={tenant.name} />
          <DetailItem label={T.SLUG} value={tenant.slug} />
          <DetailItem label={T.LOGIN_EMAIL} value={getDisplayValue(tenant.contactEmail)} />
          <DetailItem label={T.PLAN} value={planLabels[tenant.plan]} />
          <DetailItem
            label={T.STATUS}
            value={
              <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
                {statusLabels[tenant.status]}
              </Badge>
            }
          />
          <DetailItem label={T.SEATS} value={`${tenant.seatsUsed} / ${tenant.seatsTotal}`} />
          <DetailItem label={T.ACTIVATED} value={tenant.activatedAt} />
          <DetailItem label={T.EXPIRES} value={tenant.expiresAt} />
          <DetailItem label={T.LOCATION} value={getLocationLabel(tenant.location)} />
        </div>
      )}
    </Modal>
  );
};
