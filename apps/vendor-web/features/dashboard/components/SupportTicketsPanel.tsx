"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate, formatNumber } from "../utils/format";
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
      contentClassName="flex-1 flex flex-col justify-between gap-4"
      emptyWhen={(data) =>
        data.oldestOpen.length === 0
          ? { title: messages.ticketsEmpty }
          : null
      }
    >
      {(data) => (
        <div className="flex h-full flex-col justify-between gap-4">
          <ul className="flex flex-col gap-2.5">
            {data.oldestOpen.map((ticket) => {
              const categoryLabel =
                messages[`ticketCategory${ticket.category}` as keyof typeof messages] ?? ticket.category;

              return (
                <li
                  key={ticket.ticketId}
                  className="flex items-center justify-between rounded-xl border border-[var(--shell-border)]/60 bg-[var(--surface-subtle)]/40 p-3.5 transition-colors hover:bg-[var(--surface-subtle)]/80"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={ADMIN_DASHBOARD_ROUTES.ticketDetail(ticket.ticketId)}
                      className="block truncate text-sm font-semibold text-[var(--ink-primary)] hover:underline"
                    >
                      {ticket.tenantName || messages.dash}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant="neutral">{categoryLabel}</Badge>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-[var(--ink-secondary)]">
                    {formatDate(ticket.openedAt, locale)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto flex items-center justify-between border-t border-[var(--shell-border)]/60 pt-3 text-xs text-[var(--ink-secondary)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                <span>{messages.ticketsTotalOpen}</span>
                <strong className="font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.open, locale)}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
                <span>{messages.ticketsInProgress}</span>
                <strong className="font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.inProgress, locale)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </SectionPanel>
  );
};
