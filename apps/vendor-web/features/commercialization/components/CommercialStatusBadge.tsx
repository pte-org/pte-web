import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";

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
  <Badge variant={VARIANTS[status] ?? "neutral"}>{status}</Badge>
);
