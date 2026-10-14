import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";
import { BILLING_STATUS_LABELS } from "../statusConstants";

const VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  EXPIRED: "neutral",
  ACTIVE: "success",
  EXPIRING: "warning",
};

export const BillingStatusBadge = ({
  status,
  label,
}: {
  status: string;
  label?: string;
}): ReactElement => (
  <Badge variant={VARIANTS[status] ?? "neutral"}>
    {label ?? BILLING_STATUS_LABELS[status] ?? status}
  </Badge>
);
