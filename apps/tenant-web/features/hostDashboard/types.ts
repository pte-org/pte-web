import type { PlanType, SessionStatus, SubscriptionStatus } from "@pte/api-client";
import type { BadgeVariant, ChartTone, StatCardDeltaDirection, StatCardDeltaTone } from "@pte/ui";
import type { HostDashboardMessageKey } from "./messages/en";
import type { MessageValues } from "./utils/format";

export interface DeltaViewModel {
  /** Already formatted ("+12.5%"); null when there is no honest percentage (previous period was zero). */
  change: string | null;
  direction: StatCardDeltaDirection;
  tone: StatCardDeltaTone;
}

export type KpiKey = "totalLearners" | "activeLearners" | "sessions" | "attempts";

export interface KpiReady {
  key: KpiKey;
  state: "ready";
  labelKey: HostDashboardMessageKey;
  value: string;
  delta: DeltaViewModel | null;
  noteKey?: HostDashboardMessageKey;
  noteValues?: MessageValues;
}

export interface KpiUnavailable {
  key: KpiKey;
  state: "unavailable";
  labelKey: HostDashboardMessageKey;
}

export type KpiViewModel = KpiReady | KpiUnavailable;

export interface SeatUsage {
  used: number;
  limit: number;
  remaining: number;
  /** Rounded share of the limit that is used; null when there is no limit. */
  percent: number | null;
  nearLimit: boolean;
}

export type ExpiryState =
  | { kind: "none" }
  | { kind: "expired" }
  | { kind: "today" }
  | { kind: "days"; days: number };

export interface SubscriptionRow {
  id: string;
  planName: string | null;
  planType: PlanType | null;
  status: SubscriptionStatus;
  /** Formatted date; empty when the server value is not a valid instant. */
  expiresOn: string;
}

export type AttentionKind =
  | "gradingFailed"
  | "gradingBacklog"
  | "awaitingFinalisation"
  | "reportsAwaitingPublication"
  | "subscriptionExpiring"
  | "seatsNearLimit"
  | "openTickets"
  | "pendingOrders";

export type AttentionUnit = "count" | "days" | "percent";

export interface AttentionItem {
  kind: AttentionKind;
  count: number;
  unit: AttentionUnit;
  tone: BadgeVariant;
  href: string;
}

export interface AttentionResult {
  items: AttentionItem[];
  /** Sections whose data fed the list. */
  available: number;
  /** Sections that failed (their checks are missing from the list). */
  failed: number;
}

export interface UpcomingSessionRow {
  publicId: string;
  name: string;
  status: SessionStatus;
  opens: string;
  closes: string;
  enrolled: number;
  /** Null for legacy sessions without a capacity: shown as a dash. */
  capacity: number | null;
}

export interface ChartSlice {
  key: string;
  labelKey: HostDashboardMessageKey;
  value: number;
  tone: ChartTone;
}

export interface GradingRow {
  key: "pending" | "aiScoring" | "failed";
  labelKey: HostDashboardMessageKey;
  count: number;
  /** Share of the whole backlog, 0 to 100. */
  share: number;
  tone: "success" | "warning" | "danger";
}

export interface ActivityRow {
  id: string;
  titleKey: HostDashboardMessageKey;
  tone: BadgeVariant;
  /** Formatted date and time; empty when the server value is invalid. */
  when: string;
  actorKey: HostDashboardMessageKey;
}
