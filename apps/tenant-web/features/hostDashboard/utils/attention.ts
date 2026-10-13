import type { HostDashboardResponse } from "@pte/api-client";
import { HOST_DASHBOARD_ROUTES, SEAT_NEAR_LIMIT_PERCENT } from "../constants";
import type { AttentionItem, AttentionResult } from "../types";
import { sectionAvailability } from "./sections";
import { buildSeatUsage } from "./usage";

const SEVERITY_RANK: Record<AttentionItem["tone"], number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
  neutral: 4,
};

/**
 * "Needs attention" list derived from the counts of other sections. An item exists only when its
 * source section is OK and the count is above zero; a failed or forbidden source contributes
 * nothing, and failures are counted so the panel can say the list may be incomplete. Items are
 * ordered by severity, then by their declaration order.
 */
export function deriveAttention(
  dashboard: HostDashboardResponse,
  thresholdPercent: number = SEAT_NEAR_LIMIT_PERCENT,
): AttentionResult {
  const { grading, subscription, quota, support, billing } = dashboard;
  const items: AttentionItem[] = [];

  if (grading.status === "OK") {
    const { failedAnswers, pendingAnswers, aiScoringAnswers } = grading.data;
    if (failedAnswers > 0) {
      items.push({
        kind: "gradingFailed",
        count: failedAnswers,
        unit: "count",
        tone: "danger",
        href: HOST_DASHBOARD_ROUTES.exams,
      });
    }
    if (pendingAnswers + aiScoringAnswers > 0) {
      items.push({
        kind: "gradingBacklog",
        count: pendingAnswers + aiScoringAnswers,
        unit: "count",
        tone: "warning",
        href: HOST_DASHBOARD_ROUTES.exams,
      });
    }
    if (grading.data.closedSessionsAwaitingFinalisation > 0) {
      items.push({
        kind: "awaitingFinalisation",
        count: grading.data.closedSessionsAwaitingFinalisation,
        unit: "count",
        tone: "warning",
        href: HOST_DASHBOARD_ROUTES.exams,
      });
    }
    if (grading.data.reportsAwaitingPublication > 0) {
      items.push({
        kind: "reportsAwaitingPublication",
        count: grading.data.reportsAwaitingPublication,
        unit: "count",
        tone: "info",
        href: HOST_DASHBOARD_ROUTES.exams,
      });
    }
  }

  if (subscription.status === "OK" && subscription.data.expiringSoon) {
    items.push({
      kind: "subscriptionExpiring",
      count: Math.max(subscription.data.daysToExpiry ?? 0, 0),
      unit: "days",
      tone: "warning",
      href: HOST_DASHBOARD_ROUTES.billing,
    });
  }

  if (quota.status === "OK") {
    const seats = buildSeatUsage(quota.data, thresholdPercent);
    if (seats.nearLimit && seats.percent !== null) {
      items.push({
        kind: "seatsNearLimit",
        count: seats.percent,
        unit: "percent",
        tone: "warning",
        href: HOST_DASHBOARD_ROUTES.billing,
      });
    }
  }

  if (support.status === "OK" && support.data.open > 0) {
    items.push({
      kind: "openTickets",
      count: support.data.open,
      unit: "count",
      tone: "info",
      href: HOST_DASHBOARD_ROUTES.supportTickets,
    });
  }

  if (billing.status === "OK" && billing.data.pendingOrders > 0) {
    items.push({
      kind: "pendingOrders",
      count: billing.data.pendingOrders,
      unit: "count",
      tone: "warning",
      href: HOST_DASHBOARD_ROUTES.orders,
    });
  }

  const sources = [grading, subscription, quota, support, billing].map(sectionAvailability);
  return {
    // Array.prototype.sort is stable, so equal severities keep their declaration order.
    items: items.sort((a, b) => SEVERITY_RANK[a.tone] - SEVERITY_RANK[b.tone]),
    available: sources.filter((state) => state === "ok").length,
    failed: sources.filter((state) => state === "error").length,
  };
}
