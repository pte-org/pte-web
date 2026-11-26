"use client";

import Link from "next/link";
import { describeAuditEntry, formatAuditTime } from "@pte/api-client";
import { Badge, GearIcon, useLocale, type DataTableColumn } from "@pte/ui";
import type { PlatformAuditLogEntry } from "../api";
import { PLATFORM_AUDIT_LOG_COPY } from "../constants";

const TONE_DOT_CLASS = {
  create: "bg-[var(--mint-action)]",
  update: "bg-[var(--sky-action)]",
  close: "bg-[var(--ink-muted)]",
} as const;

const MUTED = "text-xs text-[var(--table-muted-text)]";

/** Where the platform admin can open the resource from the id the log keeps. */
function resourceHref(aggregateType: string, aggregateId: string): string | undefined {
  switch (aggregateType) {
    case "SupportTicket":
      return `/admin/support-tickets/${aggregateId}`;
    case "Tenant":
      return `/admin/tenants/${aggregateId}`;
    case "TENANT_APPLICATION":
      return `/admin/applications/${aggregateId}`;
    case "Question":
      return `/admin/questions/${aggregateId}`;
    default:
      return undefined;
  }
}

/** The platform audit table's columns, worded and laid out like the organization portal's. */
export function usePlatformAuditColumns(): DataTableColumn<PlatformAuditLogEntry>[] {
  const { locale } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const describe = (entry: PlatformAuditLogEntry) => describeAuditEntry(entry.log, { locale });

  return [
    {
      key: "when",
      header: T.WHEN,
      cell: ({ log }) => {
        const { date, time } = formatAuditTime(log.createdAt, locale);
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
      header: T.ACTION,
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
      key: "resource",
      header: T.RESOURCE,
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
      header: T.ACTOR,
      cell: (entry) =>
        describe(entry).isSystem ? (
          <Badge variant="neutral">
            <span className="inline-flex items-center gap-1">
              <GearIcon className="h-3 w-3" />
              {T.SYSTEM}
            </span>
          </Badge>
        ) : (
          <span className="whitespace-nowrap">{entry.actorName ?? T.UNKNOWN_ACTOR}</span>
        ),
    },
    {
      key: "summary",
      header: T.SUMMARY,
      sortable: false,
      cell: (entry) => describe(entry).summary ?? <span className={MUTED}>—</span>,
    },
  ];
}
