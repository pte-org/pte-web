import type { ReactElement } from "react";
import { StatusBadge, useLocale } from "@pte/ui";
import { STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import type { TicketStatus } from "../types";

export const TicketStatusBadge = ({ status }: { status: TicketStatus }): ReactElement => {
  const { t } = useLocale();
  const labels: Record<TicketStatus, string> = {
    OPEN: t("tenant.support.status.open", STATUS_LABELS.OPEN),
    IN_PROGRESS: t("tenant.support.status.inProgress", STATUS_LABELS.IN_PROGRESS),
    RESOLVED: t("tenant.support.status.resolved", STATUS_LABELS.RESOLVED),
    CLOSED: t("tenant.support.status.closed", STATUS_LABELS.CLOSED),
  };
  return <StatusBadge label={labels[status]} variant={STATUS_VARIANTS[status]} />;
};
