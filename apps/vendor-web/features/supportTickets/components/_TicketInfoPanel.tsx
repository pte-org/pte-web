"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { CopyableId, formatShortDateTime, useLocale } from "@pte/ui";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_TEXT } from "../constants";
import type { SupportTicketDetail } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";

interface TicketInfoPanelProps {
  ticket: SupportTicketDetail;
  /** The organization's name, once loaded; its id stands in until then. */
  tenantName?: string;
}

interface Row {
  label: string;
  value: ReactNode;
}

/** Everything about the request except its text, one fact per row, so the left column is left to reading. */
export const TicketInfoPanel = ({ ticket, tenantName }: TicketInfoPanelProps): ReactElement => {
  const T = useAdminCopy(RAW_TEXT);
  const { locale } = useLocale();
  const rows: Row[] = [
    { label: T.STATUS_LABEL, value: <TicketStatusBadge status={ticket.status} /> },
    {
      label: T.TENANT_LABEL,
      value: (
        <Link href={`/admin/tenants/${ticket.tenantId}`} className="font-semibold text-action hover:underline">
          {tenantName ?? ticket.tenantId}
        </Link>
      ),
    },
    { label: T.CATEGORY_LABEL, value: <TicketCategoryBadge category={ticket.category} /> },
    { label: T.REQUEST_ID_LABEL, value: <CopyableId value={ticket.publicId} truncateTo={8} uppercase /> },
    ...(ticket.submitterName ? [{ label: T.SUBMITTER_LABEL, value: ticket.submitterName }] : []),
    { label: T.SUBMITTED_LABEL, value: formatShortDateTime(ticket.createdAt, locale) },
    { label: T.UPDATED_LABEL, value: formatShortDateTime(ticket.updatedAt, locale) },
  ];

  return (
    <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
      <h2 className="mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]">
        {T.SECTION_INFO}
      </h2>
      <dl className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="shrink-0 text-[var(--ink-secondary)]">{row.label}</dt>
            <dd className="min-w-0 break-words text-right font-medium text-[var(--ink-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
