import type { AdminDashboardResponse } from "@pte/api-client";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import type { AdminAttentionItem, AdminAttentionResult } from "../types";
import { sectionAvailability, sectionData } from "./sections";

const SEVERITY_RANK: Record<string, number> = {
  danger: 1,
  warning: 2,
  info: 3,
  neutral: 4,
};

export function deriveAdminAttention(dashboard: AdminDashboardResponse): AdminAttentionResult {
  const applications = sectionData(dashboard.applications);
  const subscriptions = sectionData(dashboard.subscriptions);
  const licenses = sectionData(dashboard.licenses);
  const support = sectionData(dashboard.support);

  const items: AdminAttentionItem[] = [];

  if (applications && applications.pending > 0) {
    items.push({
      id: "pendingApplications",
      kind: "pendingApplications",
      count: applications.pending,
      unit: "count",
      tone: "warning",
      href: ADMIN_DASHBOARD_ROUTES.applications,
    });
  }

  if (subscriptions && subscriptions.expiringSoon > 0) {
    items.push({
      id: "expiringSubscriptions",
      kind: "expiringSubscriptions",
      count: subscriptions.expiringSoon,
      unit: "count",
      tone: "warning",
      href: ADMIN_DASHBOARD_ROUTES.subscriptions,
    });
  }

  if (licenses && licenses.expiringSoon > 0) {
    items.push({
      id: "expiringLicenses",
      kind: "expiringLicenses",
      count: licenses.expiringSoon,
      unit: "count",
      tone: "warning",
      href: ADMIN_DASHBOARD_ROUTES.licenses,
    });
  }

  if (support && support.open > 0) {
    items.push({
      id: "openTickets",
      kind: "openTickets",
      count: support.open,
      unit: "count",
      tone: "danger",
      href: ADMIN_DASHBOARD_ROUTES.supportTickets,
    });
  }

  const sources = [
    dashboard.applications,
    dashboard.subscriptions,
    dashboard.licenses,
    dashboard.support,
  ].map(sectionAvailability);

  return {
    items: items.sort((a, b) => (SEVERITY_RANK[a.tone] ?? 4) - (SEVERITY_RANK[b.tone] ?? 4)),
    available: sources.filter((s) => s === "ok").length,
    failed: sources.filter((s) => s === "error").length,
  };
}
