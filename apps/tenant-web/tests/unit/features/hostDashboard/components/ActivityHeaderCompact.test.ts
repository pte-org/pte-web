import { environment } from "../testing/environment";
import { createElement } from "react";
import type { DashboardActivityItem, HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it, vi } from "vitest";
import { ACTIVITY_ACTIONS, ACTIVITY_DISPLAY_LIMIT } from "../../../../../features/hostDashboard/constants";
import { HOST_DASHBOARD_EN } from "../../../../../features/hostDashboard/messages/en";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { ACTOR_UUID, SYSTEM_ACTOR_ID, UNKNOWN_ACTION, activityItem } from "../testing/scenarios";
import {
  hrefsOf,
  installRenderHooks,
  regionOf,
  renderHtml,
  textOf,
  useTestLocale,
} from "../testing/render";
import { CompactCards } from "../../../../../features/hostDashboard/components/CompactCards";
import { RecentActivityPanel } from "../../../../../features/hostDashboard/components/RecentActivityPanel";

installRenderHooks();

const withActivity = (items: DashboardActivityItem[], zone = "Asia/Ho_Chi_Minh"): HostDashboardResponse => {
  const base = makeDashboard();
  return { ...base, meta: { ...base.meta, zone }, recentActivity: ok(items) };
};

const renderActivity = (dashboard: HostDashboardResponse): string =>
  renderHtml(createElement(RecentActivityPanel, { dashboard, onRetry: vi.fn() }));

/** Each timeline entry as [time, title, actor]. */
const entries = (html: string): string[][] =>
  [...html.matchAll(/<li class="relative[^>]*>(.*?)<\/li>/g)].map((match) =>
    [...match[1].matchAll(/<p class="[^"]*">([^<]*)<\/p>/g)].map((paragraph) => paragraph[1]),
  );

const ORG_NOUNS = { program: "Program", programs: "Programs", class: "Class", classes: "Classes", classLower: "class" };
const expectedTitle = (messageKey: keyof typeof HOST_DASHBOARD_EN): string =>
  HOST_DASHBOARD_EN[messageKey].replace(/\{(\w+)\}/g, (_, name: string) => ORG_NOUNS[name as keyof typeof ORG_NOUNS]);

describe("RecentActivityPanel", () => {
  it("labels every known audit code with its own sentence and never shows the code", () => {
    const codes = Object.keys(ACTIVITY_ACTIONS);
    expect(codes.length).toBeGreaterThanOrEqual(25);
    for (let start = 0; start < codes.length; start += ACTIVITY_DISPLAY_LIMIT) {
      const chunk = codes.slice(start, start + ACTIVITY_DISPLAY_LIMIT);
      const html = renderActivity(
        withActivity(chunk.map((action, index) => activityItem({ id: `a${start + index}`, action, actorUserId: ACTOR_UUID }))),
      );
      expect(entries(html).map((entry) => entry[1])).toEqual(
        chunk.map((code) => expectedTitle(ACTIVITY_ACTIONS[code].messageKey)),
      );
      for (const code of chunk) expect(html).not.toContain(code);
    }
  });

  it("falls back to a generic sentence for a code the dashboard does not know", () => {
    const html = renderActivity(withActivity([activityItem({ id: "x", action: UNKNOWN_ACTION, actorUserId: ACTOR_UUID })]));
    expect(entries(html)[0][1]).toBe("Activity recorded");
    expect(html).not.toContain(UNKNOWN_ACTION);
  });

  it("says Staff member for a user id, System for the nil id, an empty id or a missing id - never the id", () => {
    const html = renderActivity(
      withActivity([
        activityItem({ id: "1", action: "ExamPublished", actorUserId: ACTOR_UUID }),
        activityItem({ id: "2", action: "ExamPublished", actorUserId: SYSTEM_ACTOR_ID }),
        activityItem({ id: "3", action: "ExamPublished", actorUserId: "" }),
        // a payload from an older backend may omit the actor altogether
        { id: "4", action: "ExamPublished", targetType: "ExamSession", occurredAt: "2026-10-12T08:30:00Z" } as DashboardActivityItem,
      ]),
    );
    expect(entries(html).map((entry) => entry[2])).toEqual(["Staff member", "System", "System", "System"]);
    expect(html).not.toContain(ACTOR_UUID);
    expect(html).not.toContain(SYSTEM_ACTOR_ID);
  });

  it("never leaks the raw action code or actor id in Vietnamese either", () => {
    useTestLocale("vi");
    const html = renderActivity(
      withActivity([
        activityItem({ id: "1", action: UNKNOWN_ACTION, actorUserId: ACTOR_UUID }),
        activityItem({ id: "2", action: "ClassCreated", actorUserId: SYSTEM_ACTOR_ID }),
      ]),
    );
    expect(entries(html)).toEqual([
      ["15:30 12 thg 10, 2026", "Đã ghi nhận một hoạt động", "Nhân sự"],
      ["15:30 12 thg 10, 2026", "Đã tạo lớp", "Hệ thống"],
    ]);
    expect(html).not.toContain(UNKNOWN_ACTION);
    expect(html).not.toContain(ACTOR_UUID);
  });

  it("uses the tenant's own nouns in the English sentences", () => {
    environment.labels = { program: "Course", class: "Cohort", isLoading: false };
    const html = renderActivity(
      withActivity([
        activityItem({ id: "1", action: "ProgramCreated", actorUserId: ACTOR_UUID }),
        activityItem({ id: "2", action: "ClassesMerged", actorUserId: ACTOR_UUID }),
        activityItem({ id: "3", action: "StudentAssignedToClass", actorUserId: ACTOR_UUID }),
      ]),
    );
    expect(entries(html).map((entry) => entry[1])).toEqual([
      "Course created",
      "Cohorts merged",
      "Learner assigned to a cohort",
    ]);
  });

  it("shows the time in the dashboard zone, including across a month and year boundary", () => {
    const html = renderActivity(
      withActivity([
        activityItem({ id: "1", action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt: "2026-10-12T08:30:00Z" }),
        activityItem({ id: "2", action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt: "2026-10-31T17:30:00Z" }),
        activityItem({ id: "3", action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt: "2026-12-31T17:00:00Z" }),
      ]),
    );
    expect(entries(html).map((entry) => entry[0])).toEqual([
      "Oct 12, 2026, 3:30 PM",
      "Nov 1, 2026, 12:30 AM",
      "Jan 1, 2027, 12:00 AM",
    ]);
  });

  it("omits the time line (no 'Invalid Date') when the instant is not valid", () => {
    const html = renderActivity(withActivity([activityItem({ id: "1", action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt: "nope" })]));
    expect(textOf(html)).not.toMatch(/Invalid|NaN/);
    expect(entries(html)[0]).toEqual(["Exam session published", "Staff member"]);
  });

  it("shows at most five entries, newest first as delivered", () => {
    const items = Array.from({ length: 11 }, (_, index) =>
      activityItem({ id: `a${index}`, action: "ExamPublished", actorUserId: ACTOR_UUID, occurredAt: `2026-10-${String(20 - index).padStart(2, "0")}T08:30:00Z` }),
    );
    const rows = entries(renderActivity(withActivity(items)));
    expect(rows).toHaveLength(ACTIVITY_DISPLAY_LIMIT);
    expect(rows[0][0]).toBe("Oct 20, 2026, 3:30 PM");
    expect(rows[4][0]).toBe("Oct 16, 2026, 3:30 PM");
  });

  it("explains an empty timeline and still links to the audit log", () => {
    const html = renderActivity(withActivity([]));
    expect(textOf(html)).toContain("No activity has been recorded yet.");
    expect(entries(html)).toEqual([]);
    expect(hrefsOf(html)).toEqual(["/host/audit-log"]);
  });

  it("failed: error state without the audit-log link; forbidden: nothing", () => {
    const errorHtml = renderActivity({ ...makeDashboard(), recentActivity: failed() });
    expect(errorHtml).toContain('role="alert"');
    expect(hrefsOf(errorHtml)).toEqual([]);
    expect(renderActivity({ ...makeDashboard(), recentActivity: forbidden() })).toBe("");
  });
});

describe("CompactCards", () => {
  const render = (dashboard: HostDashboardResponse): string =>
    renderHtml(createElement(CompactCards, { dashboard, onRetry: vi.fn() }));

  it("shows four cards with their counts and one link each to an existing screen", () => {
    const html = render(makeDashboard());
    expect(hrefsOf(html)).toEqual(["/host/exam-staff", "/host/programs", "/host/support-tickets", "/host/orders"]);
    const text = textOf(html);
    expect(text).toContain("Proctors 4 Examiners 6");
    expect(text).toContain("Organizations 2 Programs 4 Active Classes 9");
    expect(text).toContain("Open 2 In progress 1 Resolved, awaiting close 3");
    expect(text).toContain("Awaiting payment 1");
  });

  it("pending orders is a count with a link to the orders list - no payment action", () => {
    const card = regionOf(render(makeDashboard()), "Pending orders") ?? "";
    expect(hrefsOf(card)).toEqual(["/host/orders"]);
    expect(card).not.toMatch(/<button|<form|<input/);
    expect(card).not.toMatch(/https?:|checkout|pay-now|payment-link/i);
    expect(textOf(card)).toBe("Pending orders Awaiting payment 1 View orders");
  });

  it("shows large counts with the locale", () => {
    const dashboard = { ...makeDashboard(), billing: ok({ pendingOrders: 12345 }) };
    expect(textOf(render(dashboard))).toContain("Awaiting payment 12,345");
    useTestLocale("vi");
    expect(textOf(render(dashboard))).toContain("Chờ thanh toán 12.345");
  });

  it("a failed card shows its error without its link while the others stay", () => {
    const html = render({ ...makeDashboard(), staff: failed() });
    expect(regionOf(html, "Staff coverage")).toContain('role="alert"');
    expect(hrefsOf(html)).toEqual(["/host/programs", "/host/support-tickets", "/host/orders"]);
  });

  it("a forbidden card disappears entirely", () => {
    const html = render({ ...makeDashboard(), billing: forbidden(), support: forbidden() });
    expect(regionOf(html, "Pending orders")).toBeUndefined();
    expect(regionOf(html, "Support tickets")).toBeUndefined();
    expect(hrefsOf(html)).toEqual(["/host/exam-staff", "/host/programs"]);
  });
});
