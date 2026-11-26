"use client";

import Link from "next/link";
import { describeAuditEntry, formatAuditTime, type AuditLocale } from "@pte/api-client";
import { Badge, GearIcon, useLocale, type DataTableColumn } from "@pte/ui";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import type { AuditLogEntry } from "../api";
import { AUDIT_LOG_TABLE_HEADERS, AUDIT_LOG_TEXT } from "../constants";

const TONE_DOT_CLASS = {
  create: "bg-[var(--mint-action)]",
  update: "bg-[var(--sky-action)]",
  close: "bg-[var(--ink-muted)]",
} as const;

const MUTED = "text-xs text-[var(--table-muted-text)]";

/** Where the resource can be opened, when its page is reachable from the id the log keeps. */
function resourceHref(aggregateType: string, aggregateId: string): string | undefined {
  if (aggregateType === "SupportTicket") return `/host/support-tickets/${aggregateId}`;
  if (aggregateType === "ExamSession") return `/host/exams/${aggregateId}`;
  return undefined;
}

/** The audit table's columns: every cell is worded for the viewer, with the raw codes the log keeps as fallback. */
export function useAuditLogColumns(): DataTableColumn<AuditLogEntry>[] {
  const labels = useOrgLabels();
  const { locale, t } = useLocale();
  const lang: AuditLocale = locale === "vi" ? "vi" : "en";
  const unknownActor = t("tenant.audit.unknownActor", AUDIT_LOG_TEXT.unknownActor);
  const system = t("tenant.audit.system", "System");
  const describe = (entry: AuditLogEntry) =>
    describeAuditEntry(entry.log, { locale: lang, program: labels.program, class: labels.class });

  return [
    {
      key: "when",
      header: t("tenant.audit.when", AUDIT_LOG_TABLE_HEADERS.WHEN),
      cell: ({ log }) => {
        const { date, time } = formatAuditTime(log.createdAt, lang);
        return (
          <div className="tabular-nums">
            <p>{date}</p>
            <p className={MUTED}>{time}</p>
          </div>
        );
      },
    },
    {
      key: "action",
      header: t("tenant.audit.action", AUDIT_LOG_TABLE_HEADERS.ACTION),
      cell: (entry) => {
        const view = describe(entry);
        return (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT_CLASS[view.tone]}`} />
            {view.actionLabel}
          </span>
        );
      },
    },
    {
      key: "aggregateType",
      header: t("tenant.audit.resource", AUDIT_LOG_TABLE_HEADERS.AGGREGATE_TYPE),
      cell: (entry) => {
        const view = describe(entry);
        const href = resourceHref(entry.log.aggregateType, entry.log.aggregateId);
        return (
          <div className="min-w-36">
            {href ? (
              <Link href={href} className="font-medium text-action hover:underline">
                {view.name}
              </Link>
            ) : (
              <p className="font-medium">{view.name}</p>
            )}
            {view.detail && <p className={`mt-1 ${MUTED}`}>{view.detail}</p>}
          </div>
        );
      },
    },
    {
      key: "actor",
      header: t("tenant.audit.actor", AUDIT_LOG_TABLE_HEADERS.ACTOR),
      cell: (entry) =>
        describe(entry).isSystem ? (
          <Badge variant="neutral">
            <span className="inline-flex items-center gap-1">
              <GearIcon className="h-3 w-3" />
              {system}
            </span>
          </Badge>
        ) : (
          <span className="whitespace-nowrap">{entry.actorName ?? unknownActor}</span>
        ),
    },
    {
      key: "summary",
      header: t("tenant.audit.summary", AUDIT_LOG_TABLE_HEADERS.SUMMARY),
      sortable: false,
      cell: (entry) => describe(entry).summary ?? <span className={MUTED}>—</span>,
    },
  ];
}
