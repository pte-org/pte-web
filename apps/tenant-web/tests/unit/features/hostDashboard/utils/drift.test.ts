import type { HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { forbidden, makeDashboard } from "../testing/fixtures";
import { deriveAttention } from "../../../../../features/hostDashboard/utils/attention";
import { keyForCount } from "../../../../../features/hostDashboard/utils/format";
import { buildKpis } from "../../../../../features/hostDashboard/utils/kpis";
import { sectionAvailability, sectionData } from "../../../../../features/hostDashboard/utils/sections";
import { describeExpiry, expiryMessage } from "../../../../../features/hostDashboard/utils/usage";

/** A payload from a backend that predates some sections: they are absent, not FORBIDDEN. */
const without = (...names: (keyof HostDashboardResponse)[]): HostDashboardResponse => {
  const drifted: Record<string, unknown> = { ...makeDashboard() };
  for (const name of names) delete drifted[name];
  return drifted as unknown as HostDashboardResponse;
};

describe("section helpers with a missing section", () => {
  it("treat undefined and null as hidden, with no data", () => {
    expect(sectionAvailability(undefined)).toBe("forbidden");
    expect(sectionAvailability(null)).toBe("forbidden");
    expect(sectionData(undefined)).toBeUndefined();
    expect(sectionData(null)).toBeUndefined();
  });
});

describe("deriveAttention with a payload missing sections", () => {
  it("does not throw when every source is missing and reports nothing available or failed", () => {
    const result = deriveAttention(without("grading", "subscription", "quota", "support", "billing"));
    expect(result).toEqual({ items: [], available: 0, failed: 0 });
  });

  it.each(["grading", "subscription", "quota", "support", "billing"] as const)(
    "drops only the items of a missing %s section",
    (name) => {
      const full = deriveAttention(makeDashboard());
      const drifted = deriveAttention(without(name));
      expect(drifted.available).toBe(full.available - 1);
      expect(drifted.failed).toBe(0);
      expect(drifted.items.length).toBeLessThanOrEqual(full.items.length);
    },
  );

  it("equals a forbidden section for every source", () => {
    for (const name of ["grading", "subscription", "quota", "support", "billing"] as const) {
      expect(deriveAttention(without(name))).toEqual(deriveAttention({ ...makeDashboard(), [name]: forbidden() }));
    }
  });
});

describe("buildKpis with a payload missing sections", () => {
  it("returns no cards when learners, exams and attempts are all missing", () => {
    expect(buildKpis(without("learners", "exams", "attempts"), "en")).toEqual([]);
  });

  it("drops only the cards of the missing section", () => {
    expect(buildKpis(without("learners"), "en").map((card) => card.key)).toEqual(["sessions", "attempts"]);
    expect(buildKpis(without("exams"), "en").map((card) => card.key)).toEqual([
      "totalLearners",
      "activeLearners",
      "attempts",
    ]);
    expect(buildKpis(without("attempts"), "en").map((card) => card.key)).toEqual([
      "totalLearners",
      "activeLearners",
      "sessions",
    ]);
  });
});

describe("day counts choose the singular only for exactly one", () => {
  it.each([
    { count: 0, key: "many" },
    { count: 1, key: "one" },
    { count: 2, key: "many" },
    { count: 30, key: "many" },
  ])("keyForCount($count)", ({ count, key }) => {
    expect(keyForCount(count, "expiryDay", "expiryDays")).toBe(key === "one" ? "expiryDay" : "expiryDays");
  });

  it("picks the singular expiry message for one day and the plural for more", () => {
    expect(expiryMessage(describeExpiry(1))).toEqual({ key: "expiryDay", values: { days: 1 } });
    expect(expiryMessage(describeExpiry(2))).toEqual({ key: "expiryDays", values: { days: 2 } });
  });
});
