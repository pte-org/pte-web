"use client";

import type { ReactElement } from "react";
import {
  STATUS_TRANSITIONS,
  TRANSITION_LABELS as RAW_TRANSITION_LABELS,
  ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT,
} from "../constants";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import type { TicketStatus } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface StatusPanelProps {
  status: TicketStatus;
  onTransition: (next: TicketStatus) => void;
  isLoading: boolean;
}

export const StatusPanel = ({
  status,
  onTransition,
  isLoading,
}: StatusPanelProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  const transitionLabels = useAdminCopy(RAW_TRANSITION_LABELS);
  const transitions = STATUS_TRANSITIONS[status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
      <span className="text-sm font-medium text-gray-600">{T.STATUS_LABEL}:</span>
      <TicketStatusBadge status={status} />
      {transitions.map((next) => (
        <button
          key={next}
          type="button"
          disabled={isLoading}
          onClick={() => onTransition(next)}
          className="rounded-md bg-action px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-action/25 hover:bg-action-hover disabled:opacity-50"
        >
          {transitionLabels[status]}
        </button>
      ))}
    </div>
  );
};
