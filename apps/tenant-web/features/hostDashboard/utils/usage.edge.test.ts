import { describe, expect, it } from "vitest";
import { buildSeatUsage, buildSubscriptionRows, describeExpiry, expiryMessage } from "./usage";
import { formatMessage } from "./format";
import { HOST_DASHBOARD_EN } from "../messages/en";
import { HOST_DASHBOARD_VI } from "../messages/vi";

describe("buildSeatUsage near-limit boundary", () => {
  it.each([
    // used, limit, expected rounded percent, expected warning
    [88, 100, 88, false],
    [89, 100, 89, false],
    [90, 100, 90, true],
    [91, 100, 91, true],
    [178, 200, 89, false],
    [179, 200, 90, true], // 89.5 rounds up
    [894, 1000, 89, false], // 89.4
    [895, 1000, 90, true], // 89.5
    [899, 1000, 90, true], // 89.9
    [0, 100, 0, false],
    [100, 100, 100, true],
    [101, 100, 101, true],
  ])("%i of %i seats -> %i%% (warning: %s)", (used, limit, percent, nearLimit) => {
    const usage = buildSeatUsage({ used, limit, remaining: limit - used });
    expect(usage.percent).toBe(percent);
    expect(usage.nearLimit).toBe(nearLimit);
  });

  it("treats a missing capacity (limit 0 or negative) as no percentage and no warning", () => {
    for (const limit of [0, -1, -100]) {
      expect(buildSeatUsage({ used: 99, limit, remaining: 0 })).toMatchObject({ percent: null, nearLimit: false });
    }
  });

  it("clamps a negative remainder to zero but keeps the true usage", () => {
    expect(buildSeatUsage({ used: 130, limit: 100, remaining: -30 })).toMatchObject({
      used: 130,
      limit: 100,
      remaining: 0,
      percent: 130,
    });
  });

  it("passes the threshold through: any threshold at or below the percent warns, above does not", () => {
    const quota = { used: 60, limit: 100, remaining: 40 };
    expect(buildSeatUsage(quota, 60).nearLimit).toBe(true);
    expect(buildSeatUsage(quota, 61).nearLimit).toBe(false);
  });
});

describe("expiry description", () => {
  it("distinguishes none, expired, today and a day count around the zero boundary", () => {
    expect(describeExpiry(null).kind).toBe("none");
    expect(describeExpiry(-1).kind).toBe("expired");
    expect(describeExpiry(-365).kind).toBe("expired");
    expect(describeExpiry(0).kind).toBe("today");
    expect(describeExpiry(1)).toEqual({ kind: "days", days: 1 });
    expect(describeExpiry(231)).toEqual({ kind: "days", days: 231 });
  });

  it("renders a relative day count in both languages", () => {
    const message = expiryMessage(describeExpiry(231));
    expect(formatMessage(HOST_DASHBOARD_EN[message.key], message.values)).toBe("Expires in 231 days");
    expect(formatMessage(HOST_DASHBOARD_VI[message.key], message.values)).toBe("Hết hạn sau 231 ngày");
  });

  it("renders the non-count states without a day value", () => {
    for (const days of [null, -3, 0]) {
      const message = expiryMessage(describeExpiry(days));
      expect(message.values).toBeUndefined();
      expect(formatMessage(HOST_DASHBOARD_EN[message.key], message.values)).not.toMatch(/[{}]/);
    }
  });
});

describe("buildSubscriptionRows", () => {
  const base = {
    publicId: "s1",
    planName: "Plan",
    planType: "EXAM_PACKAGE" as const,
    startsAt: "2026-06-01T00:00:00Z",
    expiresAt: "2027-05-31T18:00:00Z",
    status: "ACTIVE" as const,
  };

  it("formats the expiry date in the dashboard zone (a late-evening UTC instant is already the next day)", () => {
    const [row] = buildSubscriptionRows([base], "en", "Asia/Ho_Chi_Minh");
    expect(row.expiresOn).toBe("Jun 1, 2027");
    const [utc] = buildSubscriptionRows([base], "en", "UTC");
    expect(utc.expiresOn).toBe("May 31, 2027");
  });

  it("keeps the order of the server and one row per subscription", () => {
    const rows = buildSubscriptionRows([base, { ...base, publicId: "s2" }, { ...base, publicId: "s3" }], "vi");
    expect(rows.map((row) => row.id)).toEqual(["s1", "s2", "s3"]);
  });

  it("formats the date for the Vietnamese locale", () => {
    const [row] = buildSubscriptionRows([base], "vi", "Asia/Ho_Chi_Minh");
    expect(row.expiresOn).toBe("1 thg 6, 2027");
  });

  it("carries every status through unchanged for the view to label", () => {
    const rows = buildSubscriptionRows(
      (["ACTIVE", "EXPIRED", "CANCELLED"] as const).map((status, index) => ({ ...base, publicId: `s${index}`, status })),
      "en",
    );
    expect(rows.map((row) => row.status)).toEqual(["ACTIVE", "EXPIRED", "CANCELLED"]);
  });
});
