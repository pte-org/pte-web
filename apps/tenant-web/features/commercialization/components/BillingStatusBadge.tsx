import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";

const VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  EXPIRED: "neutral",
  ACTIVE: "success",
  EXPIRING: "warning",
};

export const BillingStatusBadge = ({ status }: { status: string }): ReactElement => (
  <Badge variant={VARIANTS[status] ?? "neutral"}>{status}</Badge>
);
