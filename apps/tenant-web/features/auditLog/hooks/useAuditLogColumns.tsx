"use client";

import Link from "next/link";
import { Badge, GearIcon, useLocale, type DataTableColumn } from "@pte/ui";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/features/supportTickets/constants";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import type { AuditLogEntry } from "../api";
import {
  AUDIT_EXAM_STATUS_LABELS,
  AUDIT_LOG_ACTION_LABELS,
  AUDIT_LOG_AGGREGATE_TYPES,
  AUDIT_LOG_TABLE_HEADERS,
  AUDIT_LOG_TEXT,
  AUDIT_RESOURCE_LABELS,
  humanizeAuditCode,
} from "../constants";
import {
  AUDIT_TONE_DOT_CLASS,
  actionTone,
  formatAuditTime,
  isSystemActor,
  resourceHref,
  shortResourceId,
} from "../utils/auditFormat";
import {
  describeAuditSummary,
  resourceNameFromSummary,
  type AuditLocale,
  type AuditSummaryContext,
} from "../utils/auditSummary";

const CAMEL_STATUS: Record<string, string> = {
  OPEN: "open",
  IN_PROGRESS: "inProgress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};
const CAMEL_CATEGORY: Record<string, string> = {
  BUG: "bug",
  CONTENT_COMPLAINT: "contentComplaint",
  GENERAL_FEEDBACK: "generalFeedback",
};

const MUTED = "text-xs text-[var(--table-muted-text)]";

/** The audit table's columns: every cell is worded for the viewer, with the raw codes the log keeps as fallback. */
export function useAuditLogColumns(): DataTableColumn<AuditLogEntry>[] {
  const labels = useOrgLabels();
  const { locale, t } = useLocale();
  const lang: AuditLocale = locale === "vi" ? "vi" : "en";

  const text = {
    when: t("tenant.audit.when", AUDIT_LOG_TABLE_HEADERS.WHEN),
    resource: t("tenant.audit.resource", AUDIT_LOG_TABLE_HEADERS.AGGREGATE_TYPE),
    actor: t("tenant.audit.actor", AUDIT_LOG_TABLE_HEADERS.ACTOR),
    action: t("tenant.audit.action", AUDIT_LOG_TABLE_HEADERS.ACTION),
    summary: t("tenant.audit.summary", AUDIT_LOG_TABLE_HEADERS.SUMMARY),
    unknownActor: t("tenant.audit.unknownActor", AUDIT_LOG_TEXT.unknownActor),
    system: t("tenant.audit.system", "System"),
    program: t("tenant.audit.program", labels.program),
    class: t("tenant.audit.class", labels.class),
    supportTicket: t("tenant.audit.supportTicket", "Support ticket"),
    examSession: t("tenant.audit.examSession", "Exam session"),
  };

  const resourceKind = (value: string): string => {
    const known: Record<string, string> = {
      [AUDIT_LOG_AGGREGATE_TYPES.PROGRAM]: text.program,
      [AUDIT_LOG_AGGREGATE_TYPES.CLASS]: text.class,
      SupportTicket: text.supportTicket,
      ExamSession: text.examSession,
    };
    return known[value] ?? AUDIT_RESOURCE_LABELS[value]?.[lang] ?? humanizeAuditCode(value);
  };
  const actionLabel = (value: string): string =>
    AUDIT_LOG_ACTION_LABELS[value]?.[lang] ?? humanizeAuditCode(value);

  const summaryContext: AuditSummaryContext = {
    program: text.program,
    class: text.class,
    examStatus: (code) => AUDIT_EXAM_STATUS_LABELS[code]?.[lang] ?? humanizeAuditCode(code),
    ticketStatus: (code) => {
      const key = CAMEL_STATUS[code];
      return key ? t(`tenant.support.status.${key}`, STATUS_LABELS[code as keyof typeof STATUS_LABELS]) : code;
    },
    ticketCategory: (code) => {
      const key = CAMEL_CATEGORY[code];
      return key
        ? t(`tenant.support.category.${key}`, CATEGORY_LABELS[code as keyof typeof CATEGORY_LABELS])
        : code;
    },
  };

  return [
    {
      key: "when",
      header: text.when,
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
      header: text.action,
      cell: ({ log }) => (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${AUDIT_TONE_DOT_CLASS[actionTone(log.action)]}`} />
          {actionLabel(log.action)}
        </span>
      ),
    },
    {
      key: "aggregateType",
      header: text.resource,
      cell: ({ log }) => {
        const kind = resourceKind(log.aggregateType);
        const name =
          log.resourceName?.trim() ||
          resourceNameFromSummary(log.action, log.summary) ||
          (log.aggregateType === "SupportTicket" ? shortResourceId(log.aggregateId) : kind);
        const href = resourceHref(log.aggregateType, log.aggregateId);
        const detail = [name !== kind ? kind : null, log.resourceCode].filter(Boolean).join(" · ");
        return (
          <div className="min-w-36">
            {href ? (
              <Link href={href} className="font-medium text-action hover:underline">
                {name}
              </Link>
            ) : (
              <p className="font-medium">{name}</p>
            )}
            {detail && <p className={`mt-1 ${MUTED}`}>{detail}</p>}
          </div>
        );
      },
    },
    {
      key: "actor",
      header: text.actor,
      cell: ({ log, actorName }) =>
        isSystemActor(log.actorUserId) ? (
          <Badge variant="neutral">
            <span className="inline-flex items-center gap-1">
              <GearIcon className="h-3 w-3" />
              {text.system}
            </span>
          </Badge>
        ) : (
          <span className="whitespace-nowrap">{actorName ?? text.unknownActor}</span>
        ),
    },
    {
      key: "summary",
      header: text.summary,
      sortable: false,
      cell: ({ log }) =>
        describeAuditSummary(log.action, log.summary, log.resourceName, lang, summaryContext) ?? (
          <span className={MUTED}>—</span>
        ),
    },
  ];
}
