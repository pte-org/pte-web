import "../testing/environment";
import { createElement, type ComponentType } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it, vi } from "vitest";
import { forbidden, makeDashboard, ok } from "../testing/fixtures";
import { installRenderHooks, renderHtml, textOf, useTestLocale } from "../testing/render";
import { CompactCards } from "./CompactCards";
import { KpiRow } from "./KpiRow";
import { NeedsAttentionPanel } from "./NeedsAttentionPanel";
import { UpcomingSessionsPanel } from "./UpcomingSessionsPanel";
import { UsagePanel } from "./UsagePanel";

installRenderHooks();

interface DashboardProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
}

const render = (component: ComponentType<DashboardProps>, dashboard: HostDashboardResponse): string =>
  renderHtml(createElement(component, { dashboard, onRetry: vi.fn() }));

const COMPACT_SECTIONS = ["staff", "academics", "support", "billing"] as const;

/** A payload from a backend that predates some sections: they are absent, not FORBIDDEN. */
const without = (...names: string[]): HostDashboardResponse => {
  const drifted: Record<string, unknown> = { ...makeDashboard() };
  for (const name of names) delete drifted[name];
  return drifted as unknown as HostDashboardResponse;
};

describe("CompactCards when nothing is visible", () => {
  it("renders no wrapper and no grid cell when all four sections are FORBIDDEN", () => {
    const dashboard = makeDashboard({
      staff: forbidden(),
      academics: forbidden(),
      support: forbidden(),
      billing: forbidden(),
    });
    expect(render(CompactCards, dashboard)).toBe("");
  });

  it("renders no wrapper when all four sections are absent from the payload", () => {
    expect(render(CompactCards, without(...COMPACT_SECTIONS))).toBe("");
  });

  it.each(COMPACT_SECTIONS)("still renders the grid when only the %s section is visible", (visible) => {
    const hidden = Object.fromEntries(COMPACT_SECTIONS.filter((name) => name !== visible).map((name) => [name, forbidden()]));
    const html = render(CompactCards, { ...makeDashboard(), ...hidden });
    expect(html).toContain("grid");
    expect(html).toContain("<dl");
  });
});

describe("panels with sections missing from the payload", () => {
  it("UsagePanel hides when both of its sections are absent and renders the other half otherwise", () => {
    expect(render(UsagePanel, without("quota", "subscription"))).toBe("");
    const onlySubscription = textOf(render(UsagePanel, without("quota")));
    expect(onlySubscription).toContain("Subscriptions");
    expect(onlySubscription).not.toContain("Student seats used");
    const onlyQuota = textOf(render(UsagePanel, without("subscription")));
    expect(onlyQuota).toContain("120 of 200 seats");
    expect(onlyQuota).not.toContain("Subscriptions");
  });

  it("KpiRow hides when learners, exams and attempts are all absent", () => {
    expect(render(KpiRow, without("learners", "exams", "attempts"))).toBe("");
  });

  it("UpcomingSessionsPanel hides when exams is absent", () => {
    expect(render(UpcomingSessionsPanel, without("exams"))).toBe("");
  });

  it("NeedsAttentionPanel hides when every source is absent", () => {
    expect(render(NeedsAttentionPanel, without("grading", "subscription", "quota", "support", "billing"))).toBe("");
  });
});

describe("day counts in the singular", () => {
  const expiring = (days: number): HostDashboardResponse =>
    makeDashboard({
      subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: days, expiringSoon: false }),
    });

  it.each([
    { days: 1, en: "Expires in 1 day", vi: "Hết hạn sau 1 ngày" },
    { days: 2, en: "Expires in 2 days", vi: "Hết hạn sau 2 ngày" },
    { days: 7, en: "Expires in 7 days", vi: "Hết hạn sau 7 ngày" },
  ])("the subscription block reads correctly for $days day(s) in both locales", ({ days, en, vi: viText }) => {
    // The sentence only renders when there is a subscription row.
    const withRow = (dashboard: HostDashboardResponse): HostDashboardResponse => {
      const base = makeDashboard();
      return base.subscription.status === "OK"
        ? { ...dashboard, subscription: ok({ ...base.subscription.data, daysToExpiry: days }) }
        : dashboard;
    };
    expect(textOf(render(UsagePanel, withRow(expiring(days))))).toContain(en);
    expect(textOf(render(UsagePanel, withRow(expiring(days))))).not.toMatch(/Expires in 1 days/);
    useTestLocale("vi");
    expect(textOf(render(UsagePanel, withRow(expiring(days))))).toContain(viText);
  });
});
