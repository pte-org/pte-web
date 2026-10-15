import { describe, expect, it } from "vitest";
import { ACTIVITY_ACTIONS, SYSTEM_ACTOR_ID } from "../constants";
import { HOST_DASHBOARD_EN } from "../messages/en";
import { HOST_DASHBOARD_VI } from "../messages/vi";
import { TREND_FROM_ZERO, TREND_ZERO, failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { ACTOR_UUID, UNKNOWN_ACTION, activityItem, twelveMonths } from "../testing/scenarios";
import { buildActivityRows } from "./activity";
import { buildAttemptsChartData } from "./charts";
import { buildKpis } from "./kpis";
import { buildDelta, deltaDirection, deltaTone } from "./trend";

describe("delta mapping", () => {
  it("maps a null change to a dash (null text), flat and neutral - for previous = 0 with and without current", () => {
    for (const trend of [TREND_FROM_ZERO, TREND_ZERO]) {
      expect(buildDelta(trend, "en")).toEqual({ change: null, direction: "flat", tone: "neutral" });
      expect(buildDelta(trend, "vi")).toEqual({ change: null, direction: "flat", tone: "neutral" });
    }
  });

  it("maps 0 to flat with an unsigned 0%, never to a dash", () => {
    expect(buildDelta({ current: 3, previous: 3, changePct: 0 }, "en")).toEqual({
      change: "0%",
      direction: "flat",
      tone: "neutral",
    });
  });

  it("maps positive to up/good and negative to down/neutral (never a bad tone)", () => {
    expect(buildDelta({ current: 3, previous: 2, changePct: 50 }, "en")).toMatchObject({ direction: "up", tone: "good" });
    expect(buildDelta({ current: 1, previous: 2, changePct: -50 }, "en")).toMatchObject({
      direction: "down",
      tone: "neutral",
    });
    expect(buildDelta({ current: 0, previous: 5, changePct: -100 }, "en")).toEqual({
      change: "-100%",
      direction: "down",
      tone: "neutral",
    });
    for (const direction of ["up", "down", "flat"] as const) {
      expect(deltaTone(direction)).not.toBe("bad");
    }
  });

  it("keeps the smallest steps the backend emits (one decimal) readable and directional", () => {
    expect(buildDelta({ current: 2001, previous: 2000, changePct: 0.1 }, "en")).toEqual({
      change: "+0.1%",
      direction: "up",
      tone: "good",
    });
    expect(buildDelta({ current: 1999, previous: 2000, changePct: -0.1 }, "en")).toEqual({
      change: "-0.1%",
      direction: "down",
      tone: "neutral",
    });
  });

  it("formats the change with the locale decimal separator", () => {
    expect(buildDelta({ current: 3, previous: 2, changePct: 12.5 }, "vi").change).toMatch(/^\+12,5\s?%$/);
    expect(buildDelta({ current: 3, previous: 2, changePct: 12.5 }, "en").change).toBe("+12.5%");
  });

  it("treats NaN like a missing change", () => {
    expect(deltaDirection(Number.NaN)).toBe("flat");
    expect(buildDelta({ current: 1, previous: 1, changePct: Number.NaN }, "en").change).toBeNull();
  });
});

describe("KPI cards from a payload", () => {
  it("uses the window length of the payload in the notes", () => {
    const base = makeDashboard();
    const [total] = buildKpis({ ...base, meta: { ...base.meta, windowDays: 90 } }, "en");
    expect(total).toMatchObject({ noteValues: { days: 90 } });
  });

  it("formats the in-progress note with the locale", () => {
    const dashboard = makeDashboard({
      attempts: ok({ submitted: TREND_ZERO, inProgressNow: 1500, monthlySubmitted: [] }),
    });
    expect(buildKpis(dashboard, "vi").at(-1)).toMatchObject({ noteValues: { count: "1.500" } });
    expect(buildKpis(dashboard, "en").at(-1)).toMatchObject({ noteValues: { count: "1,500" } });
  });

  it("makes each failing source unavailable on its own and forbids silently", () => {
    expect(buildKpis(makeDashboard({ exams: failed() }), "en").map((card) => [card.key, card.state])).toEqual([
      ["totalLearners", "ready"],
      ["activeLearners", "ready"],
      ["sessions", "unavailable"],
      ["attempts", "ready"],
    ]);
    expect(buildKpis(makeDashboard({ exams: forbidden(), attempts: forbidden() }), "en").map((card) => card.key)).toEqual([
      "totalLearners",
      "activeLearners",
    ]);
  });
});

describe("attempts chart data", () => {
  it("maps twelve buckets with the partial flag on the last (month in progress) only", () => {
    const data = buildAttemptsChartData(twelveMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), "en");
    expect(data).toHaveLength(12);
    expect(data.filter((datum) => datum.partial).map((datum) => datum.label)).toEqual(["Oct 2026"]);
    expect(data.at(-1)).toEqual({ label: "Oct 2026", partial: true, submitted: 12 });
    expect(data[0]).toEqual({ label: "Nov 2025", partial: false, submitted: 1 });
  });

  it("labels months for English and Vietnamese across December/January", () => {
    const points = [
      { month: "2025-12", count: 1, partial: false },
      { month: "2026-01", count: 2, partial: false },
    ];
    expect(buildAttemptsChartData(points, "en").map((datum) => datum.label)).toEqual(["Dec 2025", "Jan 2026"]);
    expect(buildAttemptsChartData(points, "vi").map((datum) => datum.label)).toEqual(["thg 12 2025", "thg 1 2026"]);
  });

  it("keeps an all-zero year as twelve zero buckets (the chart shows its own empty state)", () => {
    const data = buildAttemptsChartData(twelveMonths(), "en");
    expect(data).toHaveLength(12);
    expect(data.every((datum) => datum.submitted === 0)).toBe(true);
  });

  it("leaves a malformed month key readable rather than throwing", () => {
    expect(buildAttemptsChartData([{ month: "bad", count: 1, partial: false }], "en")[0].label).toBe("bad");
  });
});

describe("activity mapping", () => {
  const rows = (action: string, actorUserId: string) =>
    buildActivityRows([activityItem({ id: "a", action, actorUserId })], "en");

  it("maps every known audit code to a title key of its own, in both catalogs", () => {
    for (const [code, descriptor] of Object.entries(ACTIVITY_ACTIONS)) {
      const [row] = rows(code, ACTOR_UUID);
      expect(row.titleKey, code).toBe(descriptor.messageKey);
      expect(HOST_DASHBOARD_EN[row.titleKey].trim(), code).not.toBe("");
      expect(HOST_DASHBOARD_VI[row.titleKey].trim(), code).not.toBe("");
    }
  });

  it("uses the generic title for an unknown code and keeps it out of the row", () => {
    const [row] = rows(UNKNOWN_ACTION, ACTOR_UUID);
    expect(row.titleKey).toBe("activityGeneric");
    expect(JSON.stringify(row)).not.toContain(UNKNOWN_ACTION);
  });

  it("reads the nil UUID, an empty id and a missing id as System, any other id as Staff member", () => {
    expect(rows("ExamPublished", SYSTEM_ACTOR_ID)[0].actorKey).toBe("actorSystem");
    expect(rows("ExamPublished", "")[0].actorKey).toBe("actorSystem");
    const missing = buildActivityRows(
      [{ id: "m", action: "ExamPublished", occurredAt: "2026-10-12T08:30:00Z", targetType: "X" } as never],
      "en",
    );
    expect(missing[0].actorKey).toBe("actorSystem");
    expect(rows("ExamPublished", ACTOR_UUID)[0].actorKey).toBe("actorStaff");
    expect(rows("ExamPublished", "not-a-uuid-but-an-id")[0].actorKey).toBe("actorStaff");
  });

  it("never carries the actor id or the target type into the row", () => {
    const text = JSON.stringify(rows("ExamPublished", ACTOR_UUID));
    expect(text).not.toContain(ACTOR_UUID);
    expect(text).not.toContain("ExamSession");
  });

  it("formats the time per locale and zone, across the day, month and year boundary", () => {
    // ICU may put a narrow no-break space before AM/PM; compare with plain spaces.
    const at = (occurredAt: string, locale: "en" | "vi", zone?: string): string =>
      buildActivityRows(
        [activityItem({ id: "a", action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt })],
        locale,
        zone,
      )[0].when.replace(/\s/g, " ");
    expect(at("2026-10-12T08:30:00Z", "en", "Asia/Ho_Chi_Minh")).toBe("Oct 12, 2026, 3:30 PM");
    expect(at("2026-10-31T17:30:00Z", "en", "Asia/Ho_Chi_Minh")).toBe("Nov 1, 2026, 12:30 AM");
    expect(at("2026-12-31T17:00:00Z", "en", "Asia/Ho_Chi_Minh")).toBe("Jan 1, 2027, 12:00 AM");
    expect(at("2026-10-31T17:30:00Z", "en", "UTC")).toBe("Oct 31, 2026, 5:30 PM");
    expect(at("2026-10-12T08:30:00Z", "vi", "Asia/Ho_Chi_Minh")).toBe("15:30 12 thg 10, 2026");
  });
});
