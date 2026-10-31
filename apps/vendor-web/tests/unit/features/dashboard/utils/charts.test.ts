import { describe, expect, it } from "vitest";
import { ADMIN_DASHBOARD_EN } from "../../../../../features/dashboard/messages/en";
import {
  buildGrowthSeries,
  buildOrgTypeDonutSlices,
  buildRevenueSeries,
  buildStatusDonutSlices,
  REVENUE_SERIES_KEY,
  TENANT_GROWTH_SERIES_KEY,
} from "../../../../../features/dashboard/utils/charts";

describe("buildGrowthSeries", () => {
  it("maps monthlyCreated points to chart datums", () => {
    const points = [
      { month: "2026-09", count: 12, partial: false },
      { month: "2026-10", count: 4, partial: true },
    ];
    const series = buildGrowthSeries(points, "en");

    expect(series.length).toBe(2);
    expect(series[0][TENANT_GROWTH_SERIES_KEY]).toBe(12);
    expect(series[0].partial).toBe(false);
    expect(series[1][TENANT_GROWTH_SERIES_KEY]).toBe(4);
    expect(series[1].partial).toBe(true);
  });

  it("returns empty array for empty or missing points", () => {
    expect(buildGrowthSeries([], "en")).toEqual([]);
    expect(buildGrowthSeries(null, "en")).toEqual([]);
    expect(buildGrowthSeries(undefined, "en")).toEqual([]);
  });
});

describe("buildStatusDonutSlices", () => {
  it("builds slices for active, suspended and remainder as pending", () => {
    const tenants = {
      total: 100,
      active: 80,
      suspended: 15,
      byOrganizationType: {},
      newInWindow: { current: 5, previous: 2, changePct: 150 },
      monthlyCreated: [],
    };
    const slices = buildStatusDonutSlices(tenants, ADMIN_DASHBOARD_EN);

    expect(slices.length).toBe(3);
    expect(slices[0]).toMatchObject({ key: "active", value: 80, tone: "success" });
    expect(slices[1]).toMatchObject({ key: "suspended", value: 15, tone: "danger" });
    expect(slices[2]).toMatchObject({ key: "pending", value: 5, tone: "warning" });
  });

  it("omits slices with zero count", () => {
    const tenants = {
      total: 10,
      active: 10,
      suspended: 0,
      byOrganizationType: {},
      newInWindow: { current: 1, previous: 1, changePct: 0 },
      monthlyCreated: [],
    };
    const slices = buildStatusDonutSlices(tenants, ADMIN_DASHBOARD_EN);
    expect(slices.length).toBe(1);
    expect(slices[0].key).toBe("active");
  });
});

describe("buildOrgTypeDonutSlices", () => {
  it("builds slices with translated labels and appropriate chart tones", () => {
    const byOrg = {
      UNIVERSITY: 20,
      LANGUAGE_CENTER: 10,
      ACADEMY: 0,
    };
    const slices = buildOrgTypeDonutSlices(byOrg, ADMIN_DASHBOARD_EN);

    expect(slices.length).toBe(2);
    expect(slices[0]).toMatchObject({
      key: "UNIVERSITY",
      label: ADMIN_DASHBOARD_EN.orgTypeUNIVERSITY,
      value: 20,
      tone: "brand",
    });
    expect(slices[1]).toMatchObject({
      key: "LANGUAGE_CENTER",
      label: ADMIN_DASHBOARD_EN.orgTypeLANGUAGE_CENTER,
      value: 10,
      tone: "success",
    });
  });
});

describe("buildRevenueSeries", () => {
  it("maps monthly revenue amounts to chart datums", () => {
    const monthly = [
      { month: "2026-09", amount: 50000000, partial: false },
      { month: "2026-10", amount: 20000000, partial: true },
    ];
    const series = buildRevenueSeries(monthly, "en");

    expect(series.length).toBe(2);
    expect(series[0][REVENUE_SERIES_KEY]).toBe(50000000);
    expect(series[1][REVENUE_SERIES_KEY]).toBe(20000000);
  });
});
