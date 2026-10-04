import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import type { TicketStatus } from "../types";

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export const TicketStatusBadge = ({ status }: TicketStatusBadgeProps): ReactElement => (
  <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
);
