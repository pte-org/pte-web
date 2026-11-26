/** The actor id the scheduler writes for jobs that run on their own (see the session lifecycle service). */
const SYSTEM_ACTOR_USER_ID = "00000000-0000-0000-0000-000000000000";

const GREEN_ACTIONS = /(Created|Published|Opened|Added|Assigned|Submitted|Generated|Granted|Activated|GRANT|CREATED|PUBLISHED|TRANSITION)/;
const GREY_ACTIONS = /(Closed|Closing|Deleted|Suspended|Removed|Archived)/;

export type AuditActionTone = "create" | "update" | "close";

export const AUDIT_TONE_DOT_CLASS: Record<AuditActionTone, string> = {
  create: "bg-[var(--mint-action)]",
  update: "bg-[var(--sky-action)]",
  close: "bg-[var(--ink-muted)]",
};

/** Groups actions so the eye can scan the log: creating/opening is green, closing/removing grey, the rest blue. */
export function actionTone(action: string): AuditActionTone {
  if (GREY_ACTIONS.test(action)) return "close";
  if (GREEN_ACTIONS.test(action)) return "create";
  return "update";
}

export function isSystemActor(actorUserId: string): boolean {
  return actorUserId === SYSTEM_ACTOR_USER_ID;
}

export interface AuditTimeParts {
  date: string;
  time: string;
}

/** Date with a four-digit year and time down to the second: entries seconds apart must stay distinguishable. */
export function formatAuditTime(iso: string, locale: string): AuditTimeParts {
  const date = new Date(iso);
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  return {
    date: date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  };
}

const SHORT_ID_LENGTH = 8;

/** A short form of an id for resources that have no name of their own, such as a support ticket. */
export function shortResourceId(aggregateId: string): string {
  return `#${aggregateId.slice(0, SHORT_ID_LENGTH).toUpperCase()}`;
}

/** Where the resource can be opened, when its page is reachable from the id the log keeps. */
export function resourceHref(aggregateType: string, aggregateId: string): string | undefined {
  if (aggregateType === "SupportTicket") return `/host/support-tickets/${aggregateId}`;
  if (aggregateType === "ExamSession") return `/host/exams/${aggregateId}`;
  return undefined;
}
