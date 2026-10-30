import { describe, expect, it } from "vitest";
import { failed, forbidden, makeAdminDashboard } from "../testing/fixtures";
import { buildAdminKpis } from "../../../../../features/dashboard/utils/kpis";

describe("buildAdminKpis", () => {
  it("builds 4 KPI cards when all sections are OK", () => {
    const dashboard = makeAdminDashboard();
    const kpis = buildAdminKpis(dashboard, "en");

    expect(kpis.length).toBe(4);
    expect(kpis.map((k) => k.key)).toEqual([
      "totalTenants",
      "activeLearners",
      "totalStudents",
      "expiringSubscriptions",
    ]);

    expect(kpis[0]).toMatchObject({
      key: "totalTenants",
      state: "ready",
      value: "50",
      delta: {
        change: "+100%",
        direction: "up",
        tone: "good",
      },
    });

    expect(kpis[1]).toMatchObject({
      key: "activeLearners",
      state: "ready",
    });

    expect(kpis[2]).toMatchObject({
      key: "totalStudents",
      state: "ready",
      value: "1,500",
      delta: null,
    });
  });

  it("marks cards as unavailable when a section fails with ERROR", () => {
    const dashboard = makeAdminDashboard({
      tenants: failed(),
    });

    const kpis = buildAdminKpis(dashboard, "en");
    expect(kpis[0]).toMatchObject({
      key: "totalTenants",
      state: "unavailable",
    });
    // Other cards remain ready
    expect(kpis[1].state).toBe("ready");
  });

  it("omits cards when a section is FORBIDDEN", () => {
    const dashboard = makeAdminDashboard({
      subscriptions: forbidden(),
    });

    const kpis = buildAdminKpis(dashboard, "en");
    expect(kpis.length).toBe(3);
    expect(kpis.map((k) => k.key)).not.toContain("expiringSubscriptions");
  });
});
