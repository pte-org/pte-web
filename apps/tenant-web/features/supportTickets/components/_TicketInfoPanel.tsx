"use client";

import type { ReactElement } from "react";
import { CopyableId, formatShortDateTime, useLocale } from "@pte/ui";
import { SUPPORT_TICKETS_TEXT as T } from "../constants";
import type { SupportTicketDetail } from "../types";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";

interface Row {
  label: string;
  value: ReactElement | string;
}

/** Everything about the request except its text, one fact per row, so the left column is left to reading. */
export const TicketInfoPanel = ({ ticket }: { ticket: SupportTicketDetail }): ReactElement => {
  const { locale, t } = useLocale();
  const rows: Row[] = [
    { label: t("tenant.support.status", "Status"), value: <TicketStatusBadge status={ticket.status} /> },
    { label: t("tenant.support.category", "Category"), value: <TicketCategoryBadge category={ticket.category} /> },
    { label: t("tenant.support.detail.requestId", T.REQUEST_ID), value: <CopyableId value={ticket.publicId} truncateTo={8} uppercase /> },
    ...(ticket.submitterName
      ? [{ label: t("tenant.support.detail.submitter", T.SUBMITTER), value: ticket.submitterName }]
      : []),
    { label: t("tenant.support.submitted", T.CREATED_AT), value: formatShortDateTime(ticket.createdAt, locale) },
    { label: t("tenant.support.detail.updatedAt", T.UPDATED_AT), value: formatShortDateTime(ticket.updatedAt, locale) },
  ];

  return (
    <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
      <h2 className="mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]">
        {t("tenant.support.detail.info", T.INFO_SECTION)}
      </h2>
      <dl className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-[var(--ink-secondary)]">{row.label}</dt>
            <dd className="min-w-0 text-right font-medium text-[var(--ink-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
