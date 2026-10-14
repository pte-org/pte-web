import type { BadgeVariant, StatCardDeltaDirection, StatCardDeltaTone } from "@pte/ui";
import type { AdminDashboardMessageKey } from "./messages/en";
import type { MessageValues } from "./utils/format";

export interface DeltaViewModel {
  change: string | null;
  direction: StatCardDeltaDirection;
  tone: StatCardDeltaTone;
}

export type KpiCardState = "ready" | "unavailable";

export interface KpiViewModel {
  key: string;
  state: KpiCardState;
  labelKey: AdminDashboardMessageKey;
  value?: string;
  delta?: DeltaViewModel | null;
  noteKey?: AdminDashboardMessageKey;
  noteValues?: MessageValues;
  href?: string;
}

export type AdminAttentionKind =
  | "pendingApplications"
  | "expiringSubscriptions"
  | "expiringLicenses"
  | "openTickets";

export interface AdminAttentionItem {
  id: string;
  kind: AdminAttentionKind;
  count: number;
  unit: "days" | "count";
  tone: BadgeVariant;
  href: string;
}

export interface AdminAttentionResult {
  items: AdminAttentionItem[];
  available: number;
  failed: number;
}

export interface GrowthChartPoint {
  monthKey: string;
  label: string;
  value: number;
  isPartial: boolean;
}

export interface RevenueSeriesPoint {
  monthKey: string;
  label: string;
  amount: number;
  isPartial: boolean;
}
