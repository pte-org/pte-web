import type { AuditLogResponse } from "../types/admin/auditLog";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  auditWord,
  humanizeAuditCode,
  type AuditLocale,
} from "./labels";
import { describeAuditSummary, resourceNameFromSummary, type AuditSummaryWording } from "./summary";

/** The actor id the scheduler writes for jobs that run on their own (see the session lifecycle service). */
const SYSTEM_ACTOR_USER_ID = "00000000-0000-0000-0000-000000000000";

const CREATE_ACTIONS = /(Created|Published|Opened|Added|Assigned|Submitted|Generated|Granted|Activated|Onboarded|Reactivated|GRANT|CREATED|PUBLISHED|TRANSITION)/;
const CLOSE_ACTIONS = /(Closed|Closing|Deleted|Suspended|Removed|Archived|ARCHIVED|DENIED)/;
const SHORT_ID_LENGTH = 8;

export type AuditActionTone = "create" | "update" | "close";

export interface AuditEntryView {
  actionLabel: string;
  /** Creating/opening is "create", closing/removing is "close", everything else is "update". */
  tone: AuditActionTone;
  /** What kind of resource this is ("Support ticket", "Class"…). */
  kind: string;
  /** The resource's own name or short id; the kind when it has neither. */
  name: string;
  /** The second line under the name: the kind (when the name is not it already) and the business code. */
  detail: string;
  /** True for jobs the scheduler runs, which have no person behind them. */
  isSystem: boolean;
  /** Null when the summary only repeats the resource name. */
  summary: string | null;
}

export interface AuditEntryOptions extends Partial<AuditSummaryWording> {
  locale: AuditLocale;
}

export function isSystemActor(actorUserId: string): boolean {
  return actorUserId === SYSTEM_ACTOR_USER_ID;
}

export function auditActionTone(action: string): AuditActionTone {
  if (CLOSE_ACTIONS.test(action)) return "close";
  if (CREATE_ACTIONS.test(action)) return "create";
  return "update";
}

/** A short form of an id for resources that have no name of their own, such as a support ticket. */
export function shortAuditId(aggregateId: string): string {
  return `#${aggregateId.slice(0, SHORT_ID_LENGTH).toUpperCase()}`;
}

export interface AuditTimeParts {
  date: string;
  time: string;
}

/** Date with a four-digit year and time down to the second: entries seconds apart must stay distinguishable. */
export function formatAuditTime(iso: string, locale: AuditLocale): AuditTimeParts {
  const date = new Date(iso);
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  return {
    date: date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  };
}

/** Everything a row of the audit table shows, worded for the viewer; each portal only adds its own links and styling. */
export function describeAuditEntry(log: AuditLogResponse, options: AuditEntryOptions): AuditEntryView {
  const { locale } = options;
  const wording: AuditSummaryWording = {
    program: options.program ?? (locale === "vi" ? "Chương trình" : "Program"),
    class: options.class ?? (locale === "vi" ? "Lớp học" : "Class"),
  };
  const kinds: Record<string, string> = { Program: wording.program, TrainingClass: wording.class };
  const kind = kinds[log.aggregateType] ?? auditWord(AUDIT_RESOURCE_LABELS, log.aggregateType, locale);
  const name =
    log.resourceName?.trim() ||
    resourceNameFromSummary(log.action, log.summary) ||
    (log.aggregateType === "SupportTicket" ? shortAuditId(log.aggregateId) : kind);

  return {
    actionLabel: AUDIT_ACTION_LABELS[log.action]?.[locale] ?? humanizeAuditCode(log.action),
    tone: auditActionTone(log.action),
    kind,
    name,
    detail: [name !== kind ? kind : null, log.resourceCode].filter(Boolean).join(" · "),
    isSystem: isSystemActor(log.actorUserId),
    summary: describeAuditSummary(log.action, log.summary, log.resourceName, locale, wording),
  };
}
