import "../testing/environment";
import { createElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { StatCard } from "@pte/ui";
import { describe, expect, it, vi } from "vitest";
import {
  TREND_FLAT,
  TREND_FROM_ZERO,
  TREND_GROWING,
  TREND_SHRINKING,
  failed,
  forbidden,
  makeDashboard,
  ok,
} from "../testing/fixtures";
import { installRenderHooks, recordedButtons, renderHtml, textOf, useTestLocale } from "../testing/render";
import { KpiRow } from "../../../../../features/hostDashboard/components/KpiRow";

installRenderHooks();

const render = (dashboard: HostDashboardResponse, onRetry: () => void = vi.fn()): string =>
  renderHtml(createElement(KpiRow, { dashboard, onRetry }));

const learners = (activeLearners: typeof TREND_GROWING, total = 1200) =>
  ok({ total, active: total, suspended: 0, newInWindow: TREND_GROWING, activeLearners, unassigned: 0 });

/** CSS classes of the delta wrapper that holds the sr-only direction label. */
const deltaClass = (html: string, directionLabel: string): string | undefined =>
  new RegExp(
    `<span class="([^"]*)">(?:<svg[^>]*>(?:<path[^>]*></path>)*</svg>)?<span class="sr-only">${directionLabel}</span>`,
  ).exec(html)?.[1];

describe("KpiRow delta mapping", () => {
  const html = render(makeDashboard()); // active +100%, sessions -50%, attempts 0%

  it("shows an increase with its sign and a direction label for assistive technology", () => {
    expect(textOf(html)).toContain("Increase +100% vs previous 30 days");
  });

  it("shows a decrease and a no-change with their own direction labels", () => {
    expect(textOf(html)).toContain("Decrease -50% vs previous 30 days");
    expect(textOf(html)).toContain("No change 0% vs previous 30 days");
  });

  it("colours only growth as good: a decrease reads like no change and not like a bad outcome", () => {
    const up = deltaClass(html, "Increase");
    const down = deltaClass(html, "Decrease");
    const flat = deltaClass(html, "No change");
    const bad = deltaClass(
      renderHtml(
        createElement(StatCard, {
          label: "x",
          value: "1",
          change: "-50%",
          changeDirection: "down",
          changeTone: "bad",
          changeDirectionLabel: "Decrease",
        }),
      ),
      "Decrease",
    );
    expect([up, down, flat, bad].every((value) => typeof value === "string")).toBe(true);
    expect(up).not.toBe(down);
    expect(down).toBe(flat);
    expect(down).not.toBe(bad);
  });

  it("shows a dash with an explanatory label when there is no previous period (previous = 0)", () => {
    const fromZero = render(makeDashboard({ learners: learners(TREND_FROM_ZERO, 12) }));
    expect(fromZero).toContain('<span aria-hidden="true">–</span><span class="sr-only">No previous period to compare</span>');
    // the dash card must not claim a direction
    const activeCard = textOf(fromZero).split("Active learners")[1].split("Exam sessions created")[0];
    expect(activeCard).toContain("No previous period to compare");
    expect(activeCard).not.toMatch(/Increase|Decrease|No change|%/);
  });

  it("shows -100% as a neutral decrease when the current period is zero", () => {
    const dropped = render(
      makeDashboard({ learners: learners({ current: 0, previous: 10, changePct: -100 }) }),
    );
    expect(textOf(dropped)).toContain("Decrease -100%");
  });

  it("rounds the change to one decimal", () => {
    const text = textOf(render(makeDashboard({ learners: learners({ current: 5, previous: 4, changePct: 23.456 }) })));
    expect(text).toContain("+23.5%");
  });

  it("shows the total learners card with no comparison", () => {
    const text = textOf(html);
    expect(text).toContain("Learners 1,200 40 new in the last 30 days");
    expect(text.match(/vs previous 30 days/g)).toHaveLength(3); // active, sessions, attempts
  });
});

describe("KpiRow values, windows and locale", () => {
  it("shows zero as 0 for every card", () => {
    const zero = { current: 0, previous: 0, changePct: null };
    const text = textOf(
      render(
        makeDashboard({
          learners: ok({ total: 0, active: 0, suspended: 0, newInWindow: zero, activeLearners: zero, unassigned: 0 }),
          exams: ok({
            byStatus: { DRAFT: 0, READY: 0, SCHEDULED: 0, OPEN: 0, CLOSED: 0, CANCELLED: 0 },
            created: zero,
            upcoming: [],
          }),
          attempts: ok({ submitted: zero, inProgressNow: 0, monthlySubmitted: [] }),
        }),
      ),
    );
    expect(text).toMatch(/Learners 0 0 new in the last 30 days/);
    expect(text).toMatch(/Active learners 0 – /);
    expect(text).toMatch(/Exam sessions created 0 – /);
    expect(text).toMatch(/Attempts submitted 0 – .* 0 in progress now/);
  });

  it("carries the comparison window of the payload into the subtitle, notes and period labels", () => {
    const base = makeDashboard();
    const text = textOf(render({ ...base, meta: { ...base.meta, windowDays: 7 } }));
    expect(text).toContain("The last 7 days compared with the 7 days before.");
    expect(text).toContain("40 new in the last 7 days");
    expect(text).toContain("vs previous 7 days");
    expect(text).not.toContain("30 days");
  });

  it("formats large values with the locale", () => {
    const big = makeDashboard({ learners: learners(TREND_GROWING, 1234567) });
    expect(textOf(render(big))).toContain("Learners 1,234,567");
    useTestLocale("vi");
    expect(textOf(render(big))).toContain("Học viên 1.234.567");
  });

  it("is Vietnamese for labels, direction and period", () => {
    useTestLocale("vi");
    const text = textOf(render(makeDashboard()));
    expect(text).toContain("Tăng +100% so với 30 ngày trước");
    expect(text).toContain("Giảm -50% so với 30 ngày trước");
    expect(text).toContain("Không đổi 0% so với 30 ngày trước");
    expect(text).not.toContain("Increase");
  });
});

describe("KpiRow section states", () => {
  it("marks the cards of a failed section as unavailable (dash value) and offers one retry", () => {
    const retry = vi.fn();
    const html = render(makeDashboard({ exams: failed() }), retry);
    const text = textOf(html);
    expect(text).toMatch(/Exam sessions created – Unavailable/);
    expect(text).toContain("Learners 1,200"); // other cards unaffected
    const retries = recordedButtons("Try again");
    expect(retries).toHaveLength(1);
    retries[0].onClick?.();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("offers no retry when every card loaded", () => {
    render(makeDashboard());
    expect(recordedButtons("Try again")).toHaveLength(0);
  });

  it("drops the cards of a forbidden section without a placeholder", () => {
    const text = textOf(render(makeDashboard({ learners: forbidden(), exams: forbidden() })));
    expect(text).toContain("Attempts submitted");
    expect(text).not.toMatch(/Learners|Active learners|Exam sessions created|Unavailable/);
  });

  it("renders nothing when every key-figure section is forbidden", () => {
    expect(render(makeDashboard({ learners: forbidden(), exams: forbidden(), attempts: forbidden() }))).toBe("");
  });

  it("unavailable and ready cards can sit side by side with the flat trend card intact", () => {
    const text = textOf(render(makeDashboard({ learners: failed(), attempts: ok({ submitted: TREND_FLAT, inProgressNow: 1, monthlySubmitted: [] }) })));
    expect(text.match(/Unavailable/g)).toHaveLength(2);
    expect(text).toContain("No change 0%");
    expect(text).toContain("Decrease -50%"); // sessions card (TREND_SHRINKING in the fixture)
    expect(TREND_SHRINKING.changePct).toBe(-50);
  });
});
