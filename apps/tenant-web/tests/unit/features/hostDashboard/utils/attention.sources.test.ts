import type { HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { HOST_DASHBOARD_ROUTES, SEAT_NEAR_LIMIT_PERCENT } from "../../../../../features/hostDashboard/constants";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { deriveAttention } from "../../../../../features/hostDashboard/utils/attention";

const grading = (patch: Partial<{
  pendingAnswers: number;
  aiScoringAnswers: number;
  failedAnswers: number;
  closedSessionsAwaitingFinalisation: number;
  reportsAwaitingPublication: number;
}> = {}) =>
  ok({
    pendingAnswers: 0,
    aiScoringAnswers: 0,
    failedAnswers: 0,
    closedSessionsAwaitingFinalisation: 0,
    reportsAwaitingPublication: 0,
    ...patch,
  });

const quiet = (patch: Partial<HostDashboardResponse> = {}): HostDashboardResponse =>
  makeDashboard({
    grading: grading(),
    subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: null, expiringSoon: false }),
    quota: ok({ used: 10, limit: 100, remaining: 90 }),
    support: ok({ open: 0, inProgress: 3, resolvedAwaitingClose: 5 }),
    billing: ok({ pendingOrders: 0 }),
    ...patch,
  });

const kindsOf = (dashboard: HostDashboardResponse): string[] =>
  deriveAttention(dashboard).items.map((item) => item.kind);

describe("each needs-attention source on its own", () => {
  it.each([
    {
      source: "failed answers",
      patch: { grading: grading({ failedAnswers: 3 }) },
      expected: { kind: "gradingFailed", count: 3, unit: "count", tone: "danger", href: HOST_DASHBOARD_ROUTES.exams },
    },
    {
      source: "waiting answers",
      patch: { grading: grading({ pendingAnswers: 4 }) },
      expected: { kind: "gradingBacklog", count: 4, unit: "count", tone: "warning", href: HOST_DASHBOARD_ROUTES.exams },
    },
    {
      source: "AI-scoring answers",
      patch: { grading: grading({ aiScoringAnswers: 6 }) },
      expected: { kind: "gradingBacklog", count: 6, unit: "count", tone: "warning", href: HOST_DASHBOARD_ROUTES.exams },
    },
    {
      source: "closed sessions awaiting finalisation",
      patch: { grading: grading({ closedSessionsAwaitingFinalisation: 2 }) },
      expected: { kind: "awaitingFinalisation", count: 2, unit: "count", tone: "warning", href: HOST_DASHBOARD_ROUTES.exams },
    },
    {
      source: "reports awaiting publication",
      patch: { grading: grading({ reportsAwaitingPublication: 9 }) },
      expected: { kind: "reportsAwaitingPublication", count: 9, unit: "count", tone: "info", href: HOST_DASHBOARD_ROUTES.exams },
    },
    {
      source: "an expiring subscription",
      patch: { subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 12, expiringSoon: true }) },
      expected: { kind: "subscriptionExpiring", count: 12, unit: "days", tone: "warning", href: HOST_DASHBOARD_ROUTES.billing },
    },
    {
      source: "seats near the limit",
      patch: { quota: ok({ used: 92, limit: 100, remaining: 8 }) },
      expected: { kind: "seatsNearLimit", count: 92, unit: "percent", tone: "warning", href: HOST_DASHBOARD_ROUTES.billing },
    },
    {
      source: "open tickets",
      patch: { support: ok({ open: 4, inProgress: 0, resolvedAwaitingClose: 0 }) },
      expected: { kind: "openTickets", count: 4, unit: "count", tone: "info", href: HOST_DASHBOARD_ROUTES.supportTickets },
    },
    {
      source: "pending orders",
      patch: { billing: ok({ pendingOrders: 5 }) },
      expected: { kind: "pendingOrders", count: 5, unit: "count", tone: "warning", href: HOST_DASHBOARD_ROUTES.orders },
    },
  ])("raises exactly one item for $source", ({ patch, expected }) => {
    expect(deriveAttention(quiet(patch)).items).toEqual([expected]);
  });

  it("raises nothing for a quiet payload even though in-progress and resolved tickets exist", () => {
    expect(deriveAttention(quiet()).items).toEqual([]);
  });

  it("keeps failed answers out of the backlog count (they have their own danger item)", () => {
    const items = deriveAttention(quiet({ grading: grading({ failedAnswers: 5, pendingAnswers: 1, aiScoringAnswers: 1 }) })).items;
    expect(items.find((item) => item.kind === "gradingBacklog")?.count).toBe(2);
    expect(items.find((item) => item.kind === "gradingFailed")?.count).toBe(5);
  });

  it("shows a zero count of days (expires today) rather than hiding the flagged subscription", () => {
    const items = deriveAttention(
      quiet({ subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 0, expiringSoon: true }) }),
    ).items;
    expect(items).toEqual([expect.objectContaining({ kind: "subscriptionExpiring", count: 0, unit: "days" })]);
  });
});

describe("seat warning boundary (rounded percent, threshold 90)", () => {
  const seats = (used: number, limit: number): string[] =>
    kindsOf(quiet({ quota: ok({ used, limit, remaining: limit - used }) }));

  it.each([
    [89, 100, false],
    [90, 100, true],
    [91, 100, true],
    [179, 200, true], // 89.5% rounds to 90
    [178, 200, false], // 89.0%
    [894, 1000, false], // 89.4% rounds to 89
    [895, 1000, true], // 89.5% rounds to 90
    [100, 100, true],
    [130, 100, true],
  ])("used %i of %i seats: warning %s", (used, limit, expected) => {
    expect(seats(used, limit).includes("seatsNearLimit")).toBe(expected);
  });

  it("never warns without a limit, whatever the usage", () => {
    expect(seats(50, 0)).toEqual([]);
    expect(seats(0, 0)).toEqual([]);
    expect(seats(5, -10)).toEqual([]);
  });

  it("reports the rounded percentage the label shows", () => {
    const [item] = deriveAttention(quiet({ quota: ok({ used: 895, limit: 1000, remaining: 105 }) })).items;
    expect(item.count).toBe(90);
  });

  it("honours a custom threshold and exposes the default one", () => {
    const dashboard = quiet({ quota: ok({ used: 50, limit: 100, remaining: 50 }) });
    expect(SEAT_NEAR_LIMIT_PERCENT).toBe(90);
    expect(deriveAttention(dashboard).items).toEqual([]);
    expect(deriveAttention(dashboard, 50).items.map((item) => item.kind)).toEqual(["seatsNearLimit"]);
  });
});

describe("source availability", () => {
  const BY_SOURCE: Array<{ source: "grading" | "subscription" | "quota" | "support" | "billing"; dropped: string[] }> = [
    { source: "grading", dropped: ["gradingFailed", "gradingBacklog", "awaitingFinalisation", "reportsAwaitingPublication"] },
    { source: "subscription", dropped: ["subscriptionExpiring"] },
    { source: "quota", dropped: ["seatsNearLimit"] },
    { source: "support", dropped: ["openTickets"] },
    { source: "billing", dropped: ["pendingOrders"] },
  ];
  const busy = (): HostDashboardResponse =>
    makeDashboard({
      subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 5, expiringSoon: true }),
      quota: ok({ used: 95, limit: 100, remaining: 5 }),
    });

  it("a busy payload raises all eight kinds", () => {
    expect(kindsOf(busy())).toHaveLength(8);
  });

  it.each(BY_SOURCE)("an ERROR $source drops exactly its items and counts one failure", ({ source, dropped }) => {
    const result = deriveAttention({ ...busy(), [source]: failed() });
    expect(result.items.map((item) => item.kind).filter((kind) => dropped.includes(kind))).toEqual([]);
    expect(result.items).toHaveLength(8 - dropped.length);
    expect(result).toMatchObject({ failed: 1, available: 4 });
  });

  it.each(BY_SOURCE)("a FORBIDDEN $source drops exactly its items without counting a failure", ({ source, dropped }) => {
    const result = deriveAttention({ ...busy(), [source]: forbidden() });
    expect(result.items.map((item) => item.kind).filter((kind) => dropped.includes(kind))).toEqual([]);
    expect(result.items).toHaveLength(8 - dropped.length);
    expect(result).toMatchObject({ failed: 0, available: 4 });
  });

  it("sections that are not sources (learners, exams, attempts, ...) never change the list", () => {
    const base = deriveAttention(busy());
    const others = deriveAttention({
      ...busy(),
      learners: failed(),
      exams: failed(),
      attempts: forbidden(),
      academics: failed(),
      staff: forbidden(),
      recentActivity: failed(),
    });
    expect(others).toEqual(base);
  });
});

describe("priority order", () => {
  const busy = (): HostDashboardResponse =>
    makeDashboard({
      subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 5, expiringSoon: true }),
      quota: ok({ used: 95, limit: 100, remaining: 5 }),
    });

  it("sorts danger, then warning, then info, keeping declaration order inside a severity", () => {
    expect(deriveAttention(busy()).items.map((item) => [item.tone, item.kind])).toEqual([
      ["danger", "gradingFailed"],
      ["warning", "gradingBacklog"],
      ["warning", "awaitingFinalisation"],
      ["warning", "subscriptionExpiring"],
      ["warning", "seatsNearLimit"],
      ["warning", "pendingOrders"],
      ["info", "reportsAwaitingPublication"],
      ["info", "openTickets"],
    ]);
  });

  it("puts a danger item first even when it is the only grading issue among many warnings", () => {
    const dashboard = busy();
    const [first] = deriveAttention({ ...dashboard, grading: grading({ failedAnswers: 1 }) }).items;
    expect(first.kind).toBe("gradingFailed");
  });

  it("does not mutate the payload it reads", () => {
    const dashboard = busy();
    const snapshot = JSON.stringify(dashboard);
    deriveAttention(dashboard);
    expect(JSON.stringify(dashboard)).toBe(snapshot);
  });

  it("returns a fresh result each time (no shared state between calls)", () => {
    const dashboard = busy();
    expect(deriveAttention(dashboard).items).not.toBe(deriveAttention(dashboard).items);
    expect(deriveAttention(dashboard)).toEqual(deriveAttention(dashboard));
  });
});
