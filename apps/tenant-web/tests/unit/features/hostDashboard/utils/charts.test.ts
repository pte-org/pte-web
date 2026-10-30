import { describe, expect, it } from "vitest";
import { TREND_ZERO } from "../testing/fixtures";
import {
  buildAttemptsChartData,
  buildGradingRows,
  buildLearnerSplit,
  buildSessionStatusSlices,
  buildUpcomingRows,
  countSessions,
} from "../../../../../features/hostDashboard/utils/charts";

describe("buildAttemptsChartData", () => {
  it("keeps month order, counts and the partial flag of the month in progress", () => {
    const data = buildAttemptsChartData(
      [
        { month: "2026-09", count: 30, partial: false },
        { month: "2026-10", count: 7, partial: true },
      ],
      "en",
    );
    expect(data).toEqual([
      { label: "Sep 2026", partial: false, submitted: 30 },
      { label: "Oct 2026", partial: true, submitted: 7 },
    ]);
  });

  it("returns an empty list for no months", () => {
    expect(buildAttemptsChartData([], "vi")).toEqual([]);
  });

  it("keeps zero months so the axis stays continuous", () => {
    const [point] = buildAttemptsChartData([{ month: "2026-01", count: 0, partial: false }], "en");
    expect(point.submitted).toBe(0);
  });

  it("gives labels that stay unique across a year boundary", () => {
    const labels = buildAttemptsChartData(
      [
        { month: "2025-10", count: 1, partial: false },
        { month: "2026-10", count: 2, partial: true },
      ],
      "en",
    ).map((datum) => datum.label);
    expect(new Set(labels).size).toBe(2);
  });
});

describe("session status slices", () => {
  const byStatus = { DRAFT: 1, READY: 3, SCHEDULED: 4, OPEN: 1, CLOSED: 5, CANCELLED: 0 };

  it("lists statuses with sessions, in lifecycle order, skipping zeros", () => {
    expect(buildSessionStatusSlices(byStatus).map((slice) => slice.key)).toEqual([
      "DRAFT",
      "READY",
      "SCHEDULED",
      "OPEN",
      "CLOSED",
    ]);
  });

  it("gives every slice a message key and a tone", () => {
    for (const slice of buildSessionStatusSlices(byStatus)) {
      expect(slice.labelKey).toBe(`sessionStatus${slice.key}`);
      expect(slice.tone).toBeTruthy();
    }
  });

  it("has no slices when there are no sessions", () => {
    const empty = { DRAFT: 0, READY: 0, SCHEDULED: 0, OPEN: 0, CLOSED: 0, CANCELLED: 0 };
    expect(buildSessionStatusSlices(empty)).toEqual([]);
    expect(countSessions(empty)).toBe(0);
  });

  it("counts all sessions", () => {
    expect(countSessions(byStatus)).toBe(14);
  });
});

const learners = (total: number, unassigned: number) => ({
  total,
  active: total,
  suspended: 0,
  newInWindow: TREND_ZERO,
  activeLearners: TREND_ZERO,
  unassigned,
});

describe("buildLearnerSplit", () => {
  it("splits total into assigned and unassigned", () => {
    expect(buildLearnerSplit(learners(120, 30))).toEqual({
      total: 120,
      assigned: 90,
      unassigned: 30,
    });
  });

  it("never lets unassigned exceed the total or go negative", () => {
    expect(buildLearnerSplit(learners(10, 25))).toEqual({ total: 10, assigned: 0, unassigned: 10 });
    expect(buildLearnerSplit(learners(10, -3))).toEqual({ total: 10, assigned: 10, unassigned: 0 });
  });

  it("handles a tenant without learners", () => {
    expect(buildLearnerSplit(learners(0, 0))).toEqual({ total: 0, assigned: 0, unassigned: 0 });
  });
});

describe("buildGradingRows", () => {
  const grading = (pending: number, ai: number, failedCount: number) => ({
    pendingAnswers: pending,
    aiScoringAnswers: ai,
    failedAnswers: failedCount,
    closedSessionsAwaitingFinalisation: 0,
    reportsAwaitingPublication: 0,
  });

  it("gives each step its share of the backlog", () => {
    const rows = buildGradingRows(grading(5, 3, 2));
    expect(rows.map((row) => [row.key, row.count, row.share, row.tone])).toEqual([
      ["pending", 5, 50, "warning"],
      ["aiScoring", 3, 30, "success"],
      ["failed", 2, 20, "danger"],
    ]);
  });

  it("has zero shares (not NaN) when the backlog is empty", () => {
    const rows = buildGradingRows(grading(0, 0, 0));
    expect(rows.every((row) => row.share === 0 && row.count === 0)).toBe(true);
  });

  it("gives a single step the whole backlog", () => {
    expect(buildGradingRows(grading(0, 0, 4))[2].share).toBe(100);
  });
});

describe("buildUpcomingRows", () => {
  const session = (n: number, capacity: number | null) => ({
    publicId: `id-${n}`,
    name: `Session ${n}`,
    status: "SCHEDULED" as const,
    opensAt: "2026-10-20T01:00:00Z",
    closesAt: "bad date",
    enrolled: n,
    capacity,
  });

  it("keeps a null capacity (unlimited) as null", () => {
    const [row] = buildUpcomingRows([session(1, null)], "en", "Asia/Ho_Chi_Minh");
    expect(row).toMatchObject({ publicId: "id-1", enrolled: 1, capacity: null });
  });

  it("formats open and close times and leaves an invalid one empty for the view to dash", () => {
    const [row] = buildUpcomingRows([session(1, 40)], "en", "Asia/Ho_Chi_Minh");
    expect(row.opens).toContain("2026");
    expect(row.closes).toBe("");
  });

  it("limits the list", () => {
    const sessions = Array.from({ length: 12 }, (_, index) => session(index, 10));
    expect(buildUpcomingRows(sessions, "en")).toHaveLength(8);
    expect(buildUpcomingRows(sessions, "en", undefined, 3)).toHaveLength(3);
  });

  it("returns an empty list for no sessions", () => {
    expect(buildUpcomingRows([], "en")).toEqual([]);
  });
});
