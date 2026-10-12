import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { STATUS_LABELS as RAW_STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import type { TicketStatus } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export const TicketStatusBadge = ({ status }: TicketStatusBadgeProps): ReactElement => {
  const labels = useAdminCopy(RAW_STATUS_LABELS);
  return <Badge variant={STATUS_VARIANTS[status]}>{labels[status]}</Badge>;
};
