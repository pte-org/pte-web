import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";
import { COMMERCIAL_STATUS_LABELS } from "../statusConstants";

const VARIANTS: Record<string, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  DRAFT: "neutral",
  ACTIVE: "success",
  ARCHIVED: "neutral",
  ISSUED: "info",
  REDEEMED: "success",
  REVOKED: "danger",
  EXPIRED: "warning",
};

export const CommercialStatusBadge = ({ status }: { status: string }): ReactElement => (
  <Badge variant={VARIANTS[status] ?? "neutral"}>
    {COMMERCIAL_STATUS_LABELS[status] ?? status}
  </Badge>
);
