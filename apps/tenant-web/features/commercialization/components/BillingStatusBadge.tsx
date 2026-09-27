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

export const BillingStatusBadge = ({ status }: { status: string }): ReactElement => (
  <Badge variant={VARIANTS[status] ?? "neutral"}>
    {BILLING_STATUS_LABELS[status] ?? status}
  </Badge>
);
