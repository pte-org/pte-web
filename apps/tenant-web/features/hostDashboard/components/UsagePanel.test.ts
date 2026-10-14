import "../testing/environment";
import { createElement } from "react";
import type { DashboardSubscription, HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it, vi } from "vitest";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { hrefsOf, installRenderHooks, renderHtml, textOf, useTestLocale } from "../testing/render";
import { UsagePanel } from "./UsagePanel";

installRenderHooks();

const render = (dashboard: HostDashboardResponse): string =>
  renderHtml(createElement(UsagePanel, { dashboard, onRetry: vi.fn() }));

const withQuota = (used: number, limit: number, remaining = limit - used): HostDashboardResponse =>
  makeDashboard({ quota: ok({ used, limit, remaining }) });

const subscription = (overrides: Partial<DashboardSubscription> = {}): DashboardSubscription => ({
  publicId: "33333333-3333-4333-8333-333333333333",
  planName: "Exam package 100",
  planType: "EXAM_PACKAGE",
  startsAt: "2026-06-01T00:00:00Z",
  expiresAt: "2027-06-01T00:00:00Z",
  status: "ACTIVE",
  ...overrides,
});

const withSubscriptions = (
  current: DashboardSubscription[],
  extra: { daysToExpiry?: number | null; expiringSoon?: boolean } = {},
): HostDashboardResponse =>
  makeDashboard({
    subscription: ok({
      current,
      nearestExpiryAt: null,
      daysToExpiry: extra.daysToExpiry === undefined ? 231 : extra.daysToExpiry,
      expiringSoon: extra.expiringSoon ?? false,
    }),
  });

const NEAR_LIMIT = "You are close to your seat limit";

describe("seat usage near-limit threshold (rounded percent, 90)", () => {
  it.each([
    { used: 88, nearLimit: false, label: "88% used" },
    { used: 89, nearLimit: false, label: "89% used" },
    { used: 90, nearLimit: true, label: "90% used" },
    { used: 91, nearLimit: true, label: "91% used" },
  ])("limit 100, $used used: warning $nearLimit", ({ used, nearLimit, label }) => {
    const html = render(withQuota(used, 100));
    expect(textOf(html)).toContain(label);
    expect(textOf(html).includes(NEAR_LIMIT)).toBe(nearLimit);
    expect(hrefsOf(html).filter((href) => href === "/host/billing")).toHaveLength(1);
  });

  it("uses the rounded percent so the label and the warning agree (89.4 stays quiet, 89.5 warns)", () => {
    const quiet = textOf(render(withQuota(894, 1000)));
    expect(quiet).toContain("89% used");
    expect(quiet).not.toContain(NEAR_LIMIT);
    const warns = textOf(render(withQuota(895, 1000)));
    expect(warns).toContain("90% used");
    expect(warns).toContain(NEAR_LIMIT);
  });

  it("keeps one billing action at the panel footer when the limit is near", () => {
    const html = render(withQuota(95, 100));
    expect(html).toContain('href="/host/billing">View billing</a>');
    expect(hrefsOf(html).filter((href) => href === "/host/billing")).toHaveLength(1);
  });

  it("colours the bar green below the threshold, amber from it and red when full", () => {
    expect(render(withQuota(60, 100))).toContain("bg-green-500");
    expect(render(withQuota(90, 100))).toContain("bg-amber-500");
    expect(render(withQuota(99, 100))).toContain("bg-amber-500");
    expect(render(withQuota(100, 100))).toContain("bg-red-500");
  });

  it("shows over-capacity honestly: 120%, a full bar and no negative remainder", () => {
    const html = render(withQuota(120, 100, -20));
    expect(textOf(html)).toContain("120 of 100 seats");
    expect(textOf(html)).toContain("120% used");
    expect(textOf(html)).toContain("0 seats remaining");
    expect(html).toContain('<progress value="100" max="100"');
  });

  it("shows zero usage as 0 and the whole limit as remaining", () => {
    const text = textOf(render(withQuota(0, 100)));
    expect(text).toContain("0 of 100 seats");
    expect(text).toContain("0% used");
    expect(text).toContain("100 seats remaining");
  });

  it("explains a missing limit instead of dividing by zero", () => {
    const html = render(withQuota(5, 0, 0));
    expect(textOf(html)).toContain("No seat capacity is available yet.");
    expect(html).not.toContain("<progress");
    expect(textOf(html)).not.toMatch(/NaN|Infinity/);
    expect(textOf(html)).not.toContain(NEAR_LIMIT);
  });

  it("formats seat numbers with the locale", () => {
    expect(textOf(render(withQuota(1234, 5000)))).toContain("1,234 of 5,000 seats");
    useTestLocale("vi");
    expect(textOf(render(withQuota(1234, 5000)))).toContain("1.234 / 5.000 chỗ");
  });

  it("is Vietnamese in the warning", () => {
    useTestLocale("vi");
    const text = textOf(render(withQuota(95, 100)));
    expect(text).toContain("Bạn sắp hết chỗ học viên.");
  });
});

describe("subscription block", () => {
  it("lists no plans with a plain sentence when there are none", () => {
    const html = render(withSubscriptions([]));
    expect(textOf(html)).toContain("No active subscription.");
    expect(textOf(html)).not.toMatch(/Expires/);
  });

  it("shows plan, type label, formatted expiry date and status badge", () => {
    const text = textOf(render(withSubscriptions([subscription()])));
    expect(text).toContain("Exam package 100");
    expect(text).toContain("Exam package · Expires Jun 1, 2027");
    expect(text).toContain("Active");
    expect(text).toContain("Expires in 231 days");
  });

  it("shows the expiry in the dashboard zone", () => {
    // 2027-05-31 18:00 UTC is already June 1 in Ho Chi Minh (UTC+7)
    const text = textOf(render(withSubscriptions([subscription({ expiresAt: "2027-05-31T18:00:00Z" })])));
    expect(text).toContain("Expires Jun 1, 2027");
  });

  it("uses safe fallbacks for a missing plan name or type, and labels both plan types", () => {
    const text = textOf(
      render(
        withSubscriptions([
          subscription({ planName: null, planType: null }),
          subscription({ publicId: "b", planName: "Seats", planType: "STUDENT_CAPACITY" }),
        ]),
      ),
    );
    expect(text).toContain("Subscription Plan");
    expect(text).toContain("Seats Student capacity");
    expect(text).not.toMatch(/EXAM_PACKAGE|STUDENT_CAPACITY|null/);
  });

  it("labels every subscription status with copy", () => {
    const text = textOf(
      render(
        withSubscriptions([
          subscription({ status: "ACTIVE" }),
          subscription({ publicId: "b", status: "EXPIRED" }),
          subscription({ publicId: "c", status: "CANCELLED" }),
        ]),
      ),
    );
    for (const label of ["Active", "Expired", "Cancelled"]) expect(text).toContain(label);
    expect(text).not.toMatch(/\b(?:ACTIVE|EXPIRED|CANCELLED)\b/);
  });

  it("omits the date for an invalid expiry instant", () => {
    const text = textOf(render(withSubscriptions([subscription({ expiresAt: "garbage" })])));
    expect(text).not.toContain("Expires Invalid");
    expect(text).toContain("Exam package");
  });

  it.each([
    { daysToExpiry: 7, expected: "Expires in 7 days" },
    { daysToExpiry: 0, expected: "Expires today" },
    { daysToExpiry: -3, expected: "Expired" },
    { daysToExpiry: null, expected: "No expiry date" },
  ])("describes daysToExpiry $daysToExpiry as '$expected'", ({ daysToExpiry, expected }) => {
    const text = textOf(render(withSubscriptions([subscription()], { daysToExpiry })));
    expect(text).toContain(expected);
  });

  it("describes days remaining in Vietnamese", () => {
    useTestLocale("vi");
    expect(textOf(render(withSubscriptions([subscription()], { daysToExpiry: 7 })))).toContain("Hết hạn sau 7 ngày");
  });

  it("warns when the server flags an expiring subscription, and only then", () => {
    expect(textOf(render(withSubscriptions([subscription()], { expiringSoon: true })))).toContain(
      "A subscription is about to expire.",
    );
    expect(textOf(render(withSubscriptions([subscription()], { expiringSoon: false })))).not.toContain(
      "about to expire",
    );
  });

  it("warns even with no plan listed when expiringSoon is true", () => {
    expect(textOf(render(withSubscriptions([], { expiringSoon: true })))).toContain("about to expire");
  });
});

describe("usage panel structure", () => {
  it("links to the billing page and never to a payment screen", () => {
    const hrefs = hrefsOf(render(makeDashboard()));
    expect(hrefs).toEqual(["/host/billing"]);
  });

  it("shows the subscription half only when seats are forbidden, with no error text", () => {
    const html = render({ ...makeDashboard(), quota: forbidden() });
    expect(textOf(html)).toContain("Exam package 100");
    expect(html).not.toContain('role="alert"');
    expect(textOf(html)).not.toContain("unavailable");
  });

  it("hides the panel when seats and subscription are both forbidden", () => {
    expect(render({ ...makeDashboard(), quota: forbidden(), subscription: forbidden() })).toBe("");
  });

  it("shows a forbidden half as nothing while the other half failed", () => {
    const html = render({ ...makeDashboard(), quota: forbidden(), subscription: failed() });
    expect(html).toContain("This section is unavailable");
    expect(textOf(html).match(/This section is unavailable/g)).toHaveLength(1);
  });
});
