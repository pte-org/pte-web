import type { SessionStatus, SubscriptionStatus } from "@pte/api-client";
import type { BadgeVariant, ChartTone } from "@pte/ui";
import type { HostDashboardMessageKey } from "./messages/en";
import type { AttentionKind } from "./types";

/** Single cache identity of the host dashboard; mutations elsewhere invalidate this prefix. */
export const HOST_DASHBOARD_QUERY_KEY = ["hostDashboard"] as const;

/** Server counts are cached for a short time already; avoid refetching on every remount/focus. */
export const HOST_DASHBOARD_STALE_TIME_MS = 30_000;

/** Seat usage at or above this share of the limit raises the warning. */
export const SEAT_NEAR_LIMIT_PERCENT = 90;

export const ATTEMPTS_SERIES_KEY = "submitted";
export const ACTIVITY_DISPLAY_LIMIT = 8;
export const UPCOMING_DISPLAY_LIMIT = 8;
export const PERCENT_SCALE = 100;
/** The backend uses the nil UUID for rows written without a signed-in user. */
export const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";

/** Routes verified to exist under `app/(dashboard)/host`. */
export const HOST_DASHBOARD_ROUTES = {
  students: "/host/students",
  programs: "/host/programs",
  exams: "/host/exams",
  examStaff: "/host/exam-staff",
  billing: "/host/billing",
  subscriptions: "/host/subscriptions",
  orders: "/host/orders",
  supportTickets: "/host/support-tickets",
  auditLog: "/host/audit-log",
  session: (publicId: string): string => `/host/exams/${publicId}`,
} as const;

export const SESSION_STATUS_ORDER = [
  "DRAFT",
  "PREPARING",
  "READY",
  "SCHEDULED",
  "OPEN",
  "CLOSED",
  "CANCELLED",
] as const satisfies readonly SessionStatus[];

export const SESSION_STATUS_MESSAGE_KEYS: Record<SessionStatus, HostDashboardMessageKey> = {
  DRAFT: "sessionStatusDRAFT",
  PREPARING: "sessionStatusPREPARING",
  READY: "sessionStatusREADY",
  SCHEDULED: "sessionStatusSCHEDULED",
  OPEN: "sessionStatusOPEN",
  CLOSED: "sessionStatusCLOSED",
  CANCELLED: "sessionStatusCANCELLED",
};

export const SESSION_STATUS_BADGE_VARIANT: Record<SessionStatus, BadgeVariant> = {
  DRAFT: "neutral",
  PREPARING: "info",
  READY: "success",
  SCHEDULED: "info",
  OPEN: "success",
  CLOSED: "neutral",
  CANCELLED: "danger",
};

export const SESSION_STATUS_CHART_TONE: Record<SessionStatus, ChartTone> = {
  DRAFT: "neutral",
  PREPARING: "info",
  READY: "brand",
  SCHEDULED: "warning",
  OPEN: "success",
  CLOSED: "neutral",
  CANCELLED: "danger",
};

export const SUBSCRIPTION_STATUS_MESSAGE_KEYS: Record<SubscriptionStatus, HostDashboardMessageKey> = {
  ACTIVE: "subscriptionStatusACTIVE",
  EXPIRED: "subscriptionStatusEXPIRED",
  CANCELLED: "subscriptionStatusCANCELLED",
};

export const SUBSCRIPTION_STATUS_BADGE_VARIANT: Record<SubscriptionStatus, BadgeVariant> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  CANCELLED: "danger",
};

export const PLAN_TYPE_MESSAGE_KEYS = {
  EXAM_PACKAGE: "planTypeEXAM_PACKAGE",
  STUDENT_CAPACITY: "planTypeSTUDENT_CAPACITY",
} as const satisfies Record<string, HostDashboardMessageKey>;

export const ATTENTION_MESSAGE_KEYS: Record<AttentionKind, HostDashboardMessageKey> = {
  gradingFailed: "attentionGradingFailed",
  gradingBacklog: "attentionGradingBacklog",
  awaitingFinalisation: "attentionAwaitingFinalisation",
  reportsAwaitingPublication: "attentionReports",
  subscriptionExpiring: "attentionSubscriptionExpiring",
  seatsNearLimit: "attentionSeatsNearLimit",
  openTickets: "attentionOpenTickets",
  pendingOrders: "attentionPendingOrders",
};

export interface ActivityActionDescriptor {
  messageKey: HostDashboardMessageKey;
  tone: BadgeVariant;
}

/**
 * Audit action codes the backend writes for host-visible aggregates. Any other code falls back
 * to the generic label, so a machine string is never shown.
 */
export const ACTIVITY_ACTIONS: Readonly<Record<string, ActivityActionDescriptor>> = {
  ProgramCreated: { messageKey: "activityProgramCreated", tone: "success" },
  ProgramUpdated: { messageKey: "activityProgramUpdated", tone: "neutral" },
  ProgramStatusChanged: { messageKey: "activityProgramStatusChanged", tone: "info" },
  ProgramArchived: { messageKey: "activityProgramArchived", tone: "warning" },
  ClassCreated: { messageKey: "activityClassCreated", tone: "success" },
  ClassUpdated: { messageKey: "activityClassUpdated", tone: "neutral" },
  ClassStatusChanged: { messageKey: "activityClassStatusChanged", tone: "info" },
  ClassArchived: { messageKey: "activityClassArchived", tone: "warning" },
  ClassesMerged: { messageKey: "activityClassesMerged", tone: "info" },
  ClassSplit: { messageKey: "activityClassSplit", tone: "info" },
  StudentAssignedToClass: { messageKey: "activityStudentAssigned", tone: "success" },
  StudentUnassignedFromClass: { messageKey: "activityStudentUnassigned", tone: "warning" },
  StudentTransferredClass: { messageKey: "activityStudentTransferred", tone: "info" },
  LecturerAssigned: { messageKey: "activityLecturerAssigned", tone: "success" },
  LecturerUnassigned: { messageKey: "activityLecturerUnassigned", tone: "warning" },
  ExamDraftCreated: { messageKey: "activityExamDraftCreated", tone: "neutral" },
  ExamDraftUpdated: { messageKey: "activityExamDraftUpdated", tone: "neutral" },
  ExamAudienceSourceAdded: { messageKey: "activityExamAudienceAdded", tone: "neutral" },
  ExamAudienceSourceRemoved: { messageKey: "activityExamAudienceRemoved", tone: "neutral" },
  ExamGenerated: { messageKey: "activityExamGenerated", tone: "info" },
  ExamPublished: { messageKey: "activityExamPublished", tone: "success" },
  ExamCancelled: { messageKey: "activityExamCancelled", tone: "danger" },
  TicketSubmitted: { messageKey: "activityTicketSubmitted", tone: "info" },
  TicketStatusUpdated: { messageKey: "activityTicketStatusUpdated", tone: "neutral" },
  TicketNoteAdded: { messageKey: "activityTicketNoteAdded", tone: "neutral" },
  TicketClosed: { messageKey: "activityTicketClosed", tone: "neutral" },
};

/**
 * Grid placement. Mobile follows DOM order (needs attention first); from `md` every widget gets an
 * explicit order so the key figures lead, then the page flows into two columns (`md`) or a
 * twelve-column grid (`xl`). Class names are complete literals so Tailwind can detect them.
 */
export const DASHBOARD_GRID_CLASS = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12";

export const DASHBOARD_SLOT_CLASS = {
  attention: "md:order-3 xl:order-5 xl:col-span-4",
  kpis: "md:order-1 md:col-span-2 xl:order-1 xl:col-span-12",
  usage: "md:order-2 xl:order-3 xl:col-span-4",
  trend: "md:order-4 md:col-span-2 xl:order-2 xl:col-span-8",
  upcoming: "md:order-5 md:col-span-2 xl:order-4 xl:col-span-8",
  activity: "md:order-6 xl:order-6 xl:col-span-4",
  status: "md:order-7 xl:order-7 xl:col-span-4",
  split: "md:order-8 xl:order-8 xl:col-span-4",
  grading: "md:order-9 xl:order-9 xl:col-span-6",
  compact: "md:order-10 md:col-span-2 xl:order-10 xl:col-span-6",
} as const;
