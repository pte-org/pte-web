import "../testing/environment";
import { createElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { twelveMonths } from "../testing/scenarios";
import {
  countOf,
  hrefsOf,
  installRenderHooks,
  renderHtml,
  textOf,
  useTestLocale,
  useTestOrgLabels,
} from "../testing/render";
import { AttemptsTrendPanel } from "../../../../../features/hostDashboard/components/AttemptsTrendPanel";
import { GradingPipelinePanel } from "../../../../../features/hostDashboard/components/GradingPipelinePanel";
import { LearnerSplitPanel } from "../../../../../features/hostDashboard/components/LearnerSplitPanel";
import { SessionStatusPanel } from "../../../../../features/hostDashboard/components/SessionStatusPanel";

installRenderHooks();

const noop = (): void => undefined;

const attempts = (counts: number[]): HostDashboardResponse["attempts"] =>
  ok({
    submitted: { current: 0, previous: 0, changePct: null },
    inProgressNow: 0,
    monthlySubmitted: twelveMonths(counts),
  });

const renderTrend = (section: HostDashboardResponse["attempts"]): string =>
  renderHtml(createElement(AttemptsTrendPanel, { section, onRetry: noop }));

/** Row headers of the screen-reader table behind the chart: one per month. */
const monthRows = (html: string): string[] =>
  [...html.matchAll(/<tr><th scope="row">([^<]*)<\/th><td>([^<]*)<\/td><\/tr>/g)].map(
    (match) => `${match[1]}|${match[2]}`,
  );

describe("AttemptsTrendPanel (12-month chart)", () => {
  const counts = [5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 1234];

  it("maps twelve buckets, oldest first, across the year boundary", () => {
    const rows = monthRows(renderTrend(attempts(counts)));
    expect(rows).toHaveLength(12);
    expect(rows[0]).toBe("Nov 2025|5");
    expect(rows[1]).toBe("Dec 2025|8");
    expect(rows[2]).toBe("Jan 2026|13");
    expect(rows[10].startsWith("Sep 2026|610")).toBe(true);
  });

  it("flags only the month in progress and explains it in the legend", () => {
    const html = renderTrend(attempts(counts));
    const rows = monthRows(html);
    expect(rows.filter((row) => row.includes("Month in progress"))).toEqual(["Oct 2026 (Month in progress)|1,234"]);
    expect(rows[11].startsWith("Oct 2026 (Month in progress)")).toBe(true);
    expect(textOf(html)).toContain("Month in progress");
  });

  it("formats the values like the rest of the dashboard", () => {
    expect(monthRows(renderTrend(attempts(counts)))[11]).toContain("|1,234");
    useTestLocale("vi");
    expect(monthRows(renderTrend(attempts(counts)))[11]).toContain("|1.234");
  });

  it("labels months in Vietnamese", () => {
    useTestLocale("vi");
    const rows = monthRows(renderTrend(attempts(counts)));
    expect(rows[0]).toBe("thg 11 2025|5");
    expect(rows[11]).toBe("thg 10 2026 (Tháng đang diễn ra)|1.234");
  });

  it("shows the empty state instead of an all-zero chart", () => {
    const html = renderTrend(attempts([]));
    expect(textOf(html)).toContain("No attempts have been submitted yet.");
    expect(html).not.toContain("<table");
    expect(html).not.toContain('role="img"');
  });

  it("still draws the chart when only the month in progress has attempts", () => {
    const html = renderTrend(attempts([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]));
    expect(monthRows(html)).toHaveLength(12);
    expect(textOf(html)).not.toContain("No attempts have been submitted yet.");
  });

  it("gives the chart an accessible name and a title", () => {
    const html = renderTrend(attempts(counts));
    expect(html).toContain('role="img" aria-label="Attempts submitted per month"');
    expect(html).toContain("<caption>Attempts submitted per month</caption>");
    expect(html).toContain("Month by month for the last 12 months.");
  });

  it("states of the section: error with retry, forbidden hidden", () => {
    expect(renderTrend(failed())).toContain('role="alert"');
    expect(renderTrend(forbidden())).toBe("");
  });
});

describe("SessionStatusPanel (donut)", () => {
  const render = (section: HostDashboardResponse["exams"]): string =>
    renderHtml(createElement(SessionStatusPanel, { section, onRetry: noop }));
  const byStatus = (patch: Partial<Record<string, number>>) => {
    const base = makeDashboard().exams;
    if (base.status !== "OK") throw new Error("fixture exams must be OK");
    return ok({ ...base.data, byStatus: { ...base.data.byStatus, ...patch } });
  };

  it("lists statuses that have sessions with their copy and skips the empty ones", () => {
    const html = render(byStatus({}));
    const text = textOf(html);
    for (const label of ["Draft", "Ready", "Scheduled", "Open", "Closed"]) expect(text).toContain(label);
    expect(text).not.toContain("Preparing");
    expect(text).not.toContain("Cancelled");
    expect(text).toContain("14 sessions");
    expect(text).not.toMatch(/\b(?:DRAFT|READY|SCHEDULED|CLOSED|OPEN)\b/);
    expect(hrefsOf(html)).toEqual(["/host/exams"]);
  });

  it("shows the empty state when no status has a session", () => {
    const zero = { DRAFT: 0, READY: 0, SCHEDULED: 0, OPEN: 0, CLOSED: 0, CANCELLED: 0 };
    expect(textOf(render(byStatus(zero)))).toContain("No exam sessions yet.");
  });

  it("is Vietnamese", () => {
    useTestLocale("vi");
    const text = textOf(render(byStatus({})));
    expect(text).toContain("Đã đóng");
    expect(text).toContain("14 kỳ thi");
  });

  it("failed section shows its error; forbidden is hidden", () => {
    expect(render(failed())).toContain('role="alert"');
    expect(render(forbidden())).toBe("");
  });
});

describe("LearnerSplitPanel (assigned vs unassigned donut)", () => {
  const learners = (total: number, unassigned: number): HostDashboardResponse["learners"] =>
    ok({
      total,
      active: total,
      suspended: 0,
      newInWindow: { current: 0, previous: 0, changePct: null },
      activeLearners: { current: 0, previous: 0, changePct: null },
      unassigned,
    });
  const render = (section: HostDashboardResponse["learners"]): string =>
    renderHtml(createElement(LearnerSplitPanel, { section, onRetry: noop }));

  it("splits the total and links to the students screen", () => {
    const html = render(learners(120, 30));
    const text = textOf(html);
    expect(text).toContain("In a class 90 (75%)");
    expect(text).toContain("Not in a class 30 (25%)");
    expect(hrefsOf(html)).toEqual(["/host/students"]);
  });

  it("never shows a negative or oversized slice for inconsistent counts", () => {
    const text = textOf(render(learners(10, 25)));
    expect(text).toContain("In a class 0 (0%)");
    expect(text).toContain("Not in a class 10 (100%)");
    expect(text).not.toContain("-");
  });

  it("shows the empty state for a tenant without learners", () => {
    expect(textOf(render(learners(0, 0)))).toContain("No learners yet.");
  });

  it("describes the placement with the tenant's own class noun", () => {
    useTestOrgLabels({ program: "Course", class: "Cohort" });
    const text = textOf(render(learners(10, 4)));
    expect(text).toContain("Learners placed in a cohort and those still waiting.");
    expect(text).toContain("In a cohort 6");
    expect(text).toContain("Not in a cohort 4");
  });
});

describe("GradingPipelinePanel", () => {
  const grading = (
    pending: number,
    ai: number,
    failedAnswers: number,
    finalisation = 0,
    reports = 0,
  ): HostDashboardResponse["grading"] =>
    ok({
      pendingAnswers: pending,
      aiScoringAnswers: ai,
      failedAnswers,
      closedSessionsAwaitingFinalisation: finalisation,
      reportsAwaitingPublication: reports,
    });
  const render = (section: HostDashboardResponse["grading"]): string =>
    renderHtml(createElement(GradingPipelinePanel, { section, onRetry: noop }));

  it("shows each step as a share of the backlog with its count", () => {
    const html = render(grading(5, 3, 2, 1, 4));
    expect(html).toContain('aria-label="Waiting to be graded: 50% of the backlog"');
    expect(html).toContain('aria-label="AI scoring in progress: 30% of the backlog"');
    expect(html).toContain('aria-label="Failed to score: 20% of the backlog"');
    expect(countOf(html, /<progress /)).toBe(3);
    expect(textOf(html)).toContain("Closed sessions awaiting finalization 1 Reports awaiting publication 4");
  });

  it("colours failures red and keeps the follow-up counts outside the backlog bars", () => {
    const html = render(grading(0, 0, 4, 2, 2));
    expect(html).toContain('<progress value="100" max="100" aria-label="Failed to score: 100% of the backlog"');
    expect(html).toContain("bg-red-500");
    expect(countOf(html, /<progress /)).toBe(3);
  });

  it("says there is no backlog and still shows the zero follow-up counts", () => {
    const html = render(grading(0, 0, 0, 0, 0));
    expect(textOf(html)).toContain("There is no grading backlog.");
    expect(html).not.toContain("<progress");
    expect(textOf(html)).toContain("Closed sessions awaiting finalization 0 Reports awaiting publication 0");
    expect(textOf(html)).not.toMatch(/NaN/);
  });

  it("shows follow-up work even when the answer backlog is empty", () => {
    const text = textOf(render(grading(0, 0, 0, 3, 7)));
    expect(text).toContain("There is no grading backlog.");
    expect(text).toContain("Closed sessions awaiting finalization 3 Reports awaiting publication 7");
  });

  it("formats counts with the locale and speaks Vietnamese", () => {
    useTestLocale("vi");
    const html = render(grading(1234, 0, 0, 0, 0));
    expect(textOf(html)).toContain("Đang chờ chấm 1.234");
    expect(html).toContain('aria-label="Đang chờ chấm: 100% hàng chờ"');
  });

  it("failed section shows its error; forbidden is hidden", () => {
    expect(render(failed())).toContain('role="alert"');
    expect(render(forbidden())).toBe("");
  });
});
