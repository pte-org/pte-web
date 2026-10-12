"use client";

import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { COMMERCIAL_STATUS_LABELS as RAW_COMMERCIAL_STATUS_LABELS } from "../statusConstants";

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

export const CommercialStatusBadge = ({ status }: { status: string }): ReactElement => {
  const labels = useAdminCopy(RAW_COMMERCIAL_STATUS_LABELS);

  return <Badge variant={VARIANTS[status] ?? "neutral"}>{labels[status] ?? status}</Badge>;
};
