"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface SupportTicketsPanelProps {
  section: AdminDashboardResponse["support"];
  onRetry: () => void;
  className?: string;
}

export const SupportTicketsPanel = ({
  section,
  onRetry,
  className,
}: SupportTicketsPanelProps): ReactElement | null => {
  const { locale, messages } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.ticketsTitle}
      subtitle={messages.ticketsSubtitle}
      actions={
        <Link
          href={ADMIN_DASHBOARD_ROUTES.supportTickets}
          className="text-xs font-semibold text-action hover:underline"
        >
          {messages.ticketsViewAll}
        </Link>
      }
      section={section}
      onRetry={onRetry}
      className={className}
      emptyWhen={(data) =>
        data.oldestOpen.length === 0
          ? { title: messages.ticketsEmpty }
          : null
      }
    >
      {(data) => (
        <ul className="flex flex-col divide-y divide-[var(--shell-border)]">
          {data.oldestOpen.map((ticket) => {
            const categoryLabel =
              messages[`ticketCategory${ticket.category}` as keyof typeof messages] ?? ticket.category;

            return (
              <li key={ticket.ticketId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 pr-2">
                  <Link
                    href={ADMIN_DASHBOARD_ROUTES.ticketDetail(ticket.ticketId)}
                    className="block truncate text-sm font-medium text-[var(--ink-primary)] hover:underline"
                  >
                    {ticket.tenantName || messages.dash}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="neutral">{categoryLabel}</Badge>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--ink-secondary)]">
                  {formatDate(ticket.openedAt, locale)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionPanel>
  );
};
