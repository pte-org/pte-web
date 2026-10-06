import type { ReactElement } from "react";
import { StatusBadge } from "@pte/ui";
import { STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import type { TicketStatus } from "../types";

export const TicketStatusBadge = ({ status }: { status: TicketStatus }): ReactElement => (
  <StatusBadge label={STATUS_LABELS[status]} variant={STATUS_VARIANTS[status]} />
);
