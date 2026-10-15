import { describe, expect, it } from "vitest";
import { buildSeatUsage, buildSubscriptionRows, describeExpiry, expiryMessage } from "./usage";

describe("buildSeatUsage", () => {
  it("computes the rounded percent and stays below the warning", () => {
    expect(buildSeatUsage({ used: 120, limit: 200, remaining: 80 })).toEqual({
      used: 120,
      limit: 200,
      remaining: 80,
      percent: 60,
      nearLimit: false,
    });
  });

  it("warns exactly at the threshold and not just below it", () => {
    expect(buildSeatUsage({ used: 90, limit: 100, remaining: 10 }).nearLimit).toBe(true);
    expect(buildSeatUsage({ used: 89, limit: 100, remaining: 11 }).nearLimit).toBe(false);
  });

  it("agrees with the rounded label: 89.6% reads 90% and warns", () => {
    const usage = buildSeatUsage({ used: 448, limit: 500, remaining: 52 });
    expect(usage.percent).toBe(90);
    expect(usage.nearLimit).toBe(true);
  });

  it("honours a custom threshold", () => {
    expect(buildSeatUsage({ used: 50, limit: 100, remaining: 50 }, 50).nearLimit).toBe(true);
  });

  it("has no percentage and no warning without a limit", () => {
    expect(buildSeatUsage({ used: 0, limit: 0, remaining: 0 })).toMatchObject({ percent: null, nearLimit: false });
    expect(buildSeatUsage({ used: 5, limit: 0, remaining: 0 })).toMatchObject({ percent: null, nearLimit: false });
  });

  it("reports over-capacity usage above 100% and never a negative remainder", () => {
    const usage = buildSeatUsage({ used: 120, limit: 100, remaining: -20 });
    expect(usage.percent).toBe(120);
    expect(usage.remaining).toBe(0);
    expect(usage.nearLimit).toBe(true);
  });
});

describe("describeExpiry", () => {
  it("has no expiry when there is no subscription", () => {
    expect(describeExpiry(null)).toEqual({ kind: "none" });
    expect(describeExpiry(Number.NaN)).toEqual({ kind: "none" });
  });

  it("separates expired, today and future", () => {
    expect(describeExpiry(-1)).toEqual({ kind: "expired" });
    expect(describeExpiry(0)).toEqual({ kind: "today" });
    expect(describeExpiry(7)).toEqual({ kind: "days", days: 7 });
  });
});

describe("expiryMessage", () => {
  it("maps each state to a message key, passing days only when needed", () => {
    expect(expiryMessage({ kind: "none" })).toEqual({ key: "expiryNone" });
    expect(expiryMessage({ kind: "expired" })).toEqual({ key: "expiryExpired" });
    expect(expiryMessage({ kind: "today" })).toEqual({ key: "expiryToday" });
    expect(expiryMessage({ kind: "days", days: 7 })).toEqual({ key: "expiryDays", values: { days: 7 } });
  });
});

describe("buildSubscriptionRows", () => {
  it("keeps null plan name and type so the view can use a safe fallback", () => {
    const [row] = buildSubscriptionRows(
      [
        {
          publicId: "s1",
          planName: null,
          planType: null,
          startsAt: "2026-06-01T00:00:00Z",
          expiresAt: "2026-10-20T00:00:00Z",
          status: "ACTIVE",
        },
      ],
      "en",
      "Asia/Ho_Chi_Minh",
    );
    expect(row).toMatchObject({ id: "s1", planName: null, planType: null, status: "ACTIVE" });
    expect(row.expiresOn).toContain("2026");
  });

  it("returns an empty list for no subscriptions", () => {
    expect(buildSubscriptionRows([], "en")).toEqual([]);
  });

  it("leaves the date empty when the instant is invalid", () => {
    const [row] = buildSubscriptionRows(
      [
        {
          publicId: "s2",
          planName: "Plan",
          planType: "STUDENT_CAPACITY",
          startsAt: "x",
          expiresAt: "x",
          status: "EXPIRED",
        },
      ],
      "en",
    );
    expect(row.expiresOn).toBe("");
  });
});
