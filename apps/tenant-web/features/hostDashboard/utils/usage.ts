import type { DashboardSubscription, HostQuotaData } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import { PERCENT_SCALE, SEAT_NEAR_LIMIT_PERCENT } from "../constants";
import type { HostDashboardMessageKey } from "../messages/en";
import type { ExpiryState, SeatUsage, SubscriptionRow } from "../types";
import { formatDate, keyForCount, type MessageValues } from "./format";

/**
 * Seat usage against the limit. With no limit there is no percentage and no warning (the panel
 * shows an empty-capacity hint instead). The warning uses the rounded percent so it always
 * agrees with the label shown next to the bar.
 */
export function buildSeatUsage(
  quota: HostQuotaData,
  thresholdPercent: number = SEAT_NEAR_LIMIT_PERCENT,
): SeatUsage {
  const percent =
    quota.limit > 0 ? Math.round((quota.used / quota.limit) * PERCENT_SCALE) : null;
  return {
    used: quota.used,
    limit: quota.limit,
    remaining: Math.max(quota.remaining, 0),
    percent,
    nearLimit: percent !== null && percent >= thresholdPercent,
  };
}

/** Whole days from now: negative is already expired, zero expires today. */
export function describeExpiry(daysToExpiry: number | null): ExpiryState {
  if (daysToExpiry === null || Number.isNaN(daysToExpiry)) return { kind: "none" };
  if (daysToExpiry < 0) return { kind: "expired" };
  if (daysToExpiry === 0) return { kind: "today" };
  return { kind: "days", days: daysToExpiry };
}

export function expiryMessage(state: ExpiryState): { key: HostDashboardMessageKey; values?: MessageValues } {
  switch (state.kind) {
    case "none":
      return { key: "expiryNone" };
    case "expired":
      return { key: "expiryExpired" };
    case "today":
      return { key: "expiryToday" };
    case "days":
      return { key: keyForCount(state.days, "expiryDay", "expiryDays"), values: { days: state.days } };
  }
}

export function buildSubscriptionRows(
  subscriptions: readonly DashboardSubscription[],
  locale: Locale,
  timeZone?: string,
): SubscriptionRow[] {
  return subscriptions.map((subscription) => ({
    id: subscription.publicId,
    planName: subscription.planName,
    planType: subscription.planType,
    status: subscription.status,
    expiresOn: formatDate(subscription.expiresAt, locale, timeZone),
  }));
}
