import type {
  AdminDashboardMessages,
  AdminDashboardMessageKey,
} from "../messages/en";
import type {
  AdminTenantsData,
  MonthlyAmount,
  MonthlyPoint,
} from "@pte/api-client";
import type { ChartTone, Locale, StatusDonutItem, TrendChartDatum } from "@pte/ui";
import { formatMonthLabel } from "./format";

export const TENANT_GROWTH_SERIES_KEY = "newTenants";
export const REVENUE_SERIES_KEY = "revenue";

export function buildGrowthSeries(
  monthlyCreated: readonly MonthlyPoint[] | undefined | null,
  locale: Locale,
): TrendChartDatum[] {
  if (!monthlyCreated || monthlyCreated.length === 0) return [];
  return monthlyCreated.map((point) => ({
    label: formatMonthLabel(point.month, locale),
    partial: point.partial,
    [TENANT_GROWTH_SERIES_KEY]: point.count,
  }));
}

export function buildStatusDonutSlices(
  tenants: AdminTenantsData | undefined | null,
  messages: AdminDashboardMessages,
): StatusDonutItem[] {
  if (!tenants) return [];
  const slices: StatusDonutItem[] = [];

  if (tenants.active > 0) {
    slices.push({
      key: "active",
      label: messages.statusActive,
      value: tenants.active,
      tone: "success",
    });
  }
  if (tenants.suspended > 0) {
    slices.push({
      key: "suspended",
      label: messages.statusSuspended,
      value: tenants.suspended,
      tone: "danger",
    });
  }

  const remainder = tenants.total - (tenants.active + tenants.suspended);
  if (remainder > 0) {
    slices.push({
      key: "pending",
      label: messages.statusPending,
      value: remainder,
      tone: "warning",
    });
  }

  return slices;
}

const ORG_TYPE_TONES: Record<string, ChartTone> = {
  UNIVERSITY: "brand",
  COLLEGE: "info",
  SCHOOL: "info",
  ACADEMY: "brand",
  LANGUAGE_CENTER: "success",
  TRAINING_CENTER: "success",
  CENTER: "success",
  ENTERPRISE: "warning",
  CORPORATION: "warning",
  CORPORATE: "warning",
  OTHER: "neutral",
};

export function buildOrgTypeDonutSlices(
  byOrgType: Record<string, number> | undefined | null,
  messages: AdminDashboardMessages,
): StatusDonutItem[] {
  if (!byOrgType) return [];
  return Object.entries(byOrgType)
    .filter(([, count]) => count > 0)
    .map(([typeKey, count]) => {
      const messageKey = `orgType${typeKey}` as AdminDashboardMessageKey;
      const label = messages[messageKey] ?? typeKey;
      return {
        key: typeKey,
        label,
        value: count,
        tone: ORG_TYPE_TONES[typeKey] ?? "neutral",
      };
    });
}

export function buildRevenueSeries(
  monthly: readonly MonthlyAmount[] | undefined | null,
  locale: Locale,
): TrendChartDatum[] {
  if (!monthly || monthly.length === 0) return [];
  return monthly.map((point) => ({
    label: formatMonthLabel(point.month, locale),
    partial: point.partial,
    [REVENUE_SERIES_KEY]: point.amount,
  }));
}
