import { describe, expect, it } from "vitest";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { deriveAttention } from "./attention";

const quietDashboard = () =>
  makeDashboard({
    grading: ok({
      pendingAnswers: 0,
      aiScoringAnswers: 0,
      failedAnswers: 0,
      closedSessionsAwaitingFinalisation: 0,
      reportsAwaitingPublication: 0,
    }),
    subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: null, expiringSoon: false }),
    quota: ok({ used: 0, limit: 0, remaining: 0 }),
    support: ok({ open: 0, inProgress: 0, resolvedAwaitingClose: 0 }),
    billing: ok({ pendingOrders: 0 }),
  });

describe("deriveAttention", () => {
  it("has no items and counts every source as available when nothing is waiting", () => {
    expect(deriveAttention(quietDashboard())).toEqual({ items: [], available: 5, failed: 0 });
  });

  it("derives every item of a busy payload, most severe first", () => {
    const dashboard = makeDashboard({
      subscription: ok({
        current: [],
        nearestExpiryAt: "2026-10-20T00:00:00Z",
        daysToExpiry: 7,
        expiringSoon: true,
      }),
      quota: ok({ used: 95, limit: 100, remaining: 5 }),
    });
    const result = deriveAttention(dashboard);
    expect(result.items.map((item) => item.kind)).toEqual([
      "gradingFailed",
      "gradingBacklog",
      "awaitingFinalisation",
      "subscriptionExpiring",
      "seatsNearLimit",
      "pendingOrders",
      "reportsAwaitingPublication",
      "openTickets",
    ]);
    expect(result.items[0]).toMatchObject({ count: 2, tone: "danger", unit: "count" });
  });

  it("sums waiting and AI-scoring answers into one backlog item", () => {
    const [, backlog] = deriveAttention(makeDashboard()).items;
    expect(backlog).toMatchObject({ kind: "gradingBacklog", count: 6 });
  });

  it("reports days for the expiring subscription and never a negative count", () => {
    const expiring = (days: number | null) =>
      deriveAttention(
        makeDashboard({
          subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: days, expiringSoon: true }),
        }),
      ).items.find((item) => item.kind === "subscriptionExpiring");
    expect(expiring(7)).toMatchObject({ count: 7, unit: "days" });
    expect(expiring(-2)).toMatchObject({ count: 0 });
    expect(expiring(null)).toMatchObject({ count: 0 });
  });

  it("does not list an expiry that is not near", () => {
    expect(deriveAttention(makeDashboard()).items.some((item) => item.kind === "subscriptionExpiring")).toBe(false);
  });

  it("reports the seat percentage only at or above the threshold", () => {
    const seats = (used: number) =>
      deriveAttention(makeDashboard({ quota: ok({ used, limit: 100, remaining: 100 - used }) })).items.find(
        (item) => item.kind === "seatsNearLimit",
      );
    expect(seats(89)).toBeUndefined();
    expect(seats(90)).toMatchObject({ count: 90, unit: "percent" });
  });

  it("uses open tickets only (in progress and resolved are not waiting on the host)", () => {
    const tickets = deriveAttention(makeDashboard()).items.find((item) => item.kind === "openTickets");
    expect(tickets).toMatchObject({ count: 2 });
  });

  it("links every item to a known host route", () => {
    for (const item of deriveAttention(makeDashboard()).items) {
      expect(item.href.startsWith("/host/")).toBe(true);
    }
  });

  it("hides items of a failed source and counts the failure", () => {
    const result = deriveAttention(makeDashboard({ grading: failed(), support: failed() }));
    expect(result.failed).toBe(2);
    expect(result.available).toBe(3);
    expect(result.items.map((item) => item.kind)).toEqual(["pendingOrders"]);
  });

  it("hides items of a forbidden source without counting it as a failure", () => {
    const result = deriveAttention(makeDashboard({ billing: forbidden(), support: forbidden() }));
    expect(result.failed).toBe(0);
    expect(result.available).toBe(3);
    expect(result.items.some((item) => item.kind === "pendingOrders" || item.kind === "openTickets")).toBe(false);
  });

  it("reports nothing available when every source is forbidden", () => {
    const result = deriveAttention(
      makeDashboard({
        grading: forbidden(),
        subscription: forbidden(),
        quota: forbidden(),
        support: forbidden(),
        billing: forbidden(),
      }),
    );
    expect(result).toEqual({ items: [], available: 0, failed: 0 });
  });

  it("reports only failures when every source failed", () => {
    const result = deriveAttention(
      makeDashboard({
        grading: failed(),
        subscription: failed(),
        quota: failed(),
        support: failed(),
        billing: failed(),
      }),
    );
    expect(result).toEqual({ items: [], available: 0, failed: 5 });
  });
});
