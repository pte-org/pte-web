import type { AdminDashboardResponse } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import type { KpiViewModel } from "../types";
import { formatNumber } from "./format";
import { sectionAvailability, sectionData } from "./sections";
import { buildDelta } from "./trend";

export function buildAdminKpis(dashboard: AdminDashboardResponse, locale: Locale): KpiViewModel[] {
  const { meta } = dashboard;
  const tenants = sectionData(dashboard.tenants);
  const learners = sectionData(dashboard.learners);
  const subscriptions = sectionData(dashboard.subscriptions);

  const cards: KpiViewModel[] = [];

  // Card 1: Total Tenants
  if (sectionAvailability(dashboard.tenants) !== "forbidden") {
    cards.push(
      tenants
        ? {
            key: "totalTenants",
            state: "ready",
            labelKey: "kpiTotalTenants",
            value: formatNumber(tenants.total, locale),
            delta: buildDelta(tenants.newInWindow, locale),
            noteKey: "kpiNewTenantsNote",
            noteValues: {
              count: formatNumber(tenants.newInWindow.current, locale),
              days: meta.windowDays,
            },
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          }
        : {
            key: "totalTenants",
            state: "unavailable",
            labelKey: "kpiTotalTenants",
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          },
    );
  }

  // Card 2: Active Learners
  if (sectionAvailability(dashboard.learners) !== "forbidden") {
    cards.push(
      learners
        ? {
            key: "activeLearners",
            state: "ready",
            labelKey: "kpiActiveLearners",
            value: formatNumber(learners.activeLearners.current, locale),
            delta: buildDelta(learners.activeLearners, locale),
            noteKey: "kpiActiveLearnersNote",
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          }
        : {
            key: "activeLearners",
            state: "unavailable",
            labelKey: "kpiActiveLearners",
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          },
    );

    // Card 3: Total Enrolled Students
    cards.push(
      learners
        ? {
            key: "totalStudents",
            state: "ready",
            labelKey: "kpiTotalStudents",
            value: formatNumber(learners.totalStudents, locale),
            delta: null,
            noteKey: "kpiTotalSeats",
            noteValues: {
              count: formatNumber(learners.totalSeats, locale),
            },
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          }
        : {
            key: "totalStudents",
            state: "unavailable",
            labelKey: "kpiTotalStudents",
            href: ADMIN_DASHBOARD_ROUTES.tenants,
          },
    );
  }

  // Card 4: Expiring Subscriptions
  if (sectionAvailability(dashboard.subscriptions) !== "forbidden") {
    cards.push(
      subscriptions
        ? {
            key: "expiringSubscriptions",
            state: "ready",
            labelKey: "kpiExpiringSubscriptions",
            value: formatNumber(subscriptions.expiringSoon, locale),
            delta: buildDelta(subscriptions.activatedInWindow, locale),
            noteKey: "kpiExpiringSubscriptionsNote",
            noteValues: {
              days: subscriptions.expiringSoonDays,
            },
            href: ADMIN_DASHBOARD_ROUTES.subscriptions,
          }
        : {
            key: "expiringSubscriptions",
            state: "unavailable",
            labelKey: "kpiExpiringSubscriptions",
            href: ADMIN_DASHBOARD_ROUTES.subscriptions,
          },
    );
  }

  return cards;
}
