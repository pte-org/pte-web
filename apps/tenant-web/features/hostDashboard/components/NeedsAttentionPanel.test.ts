import "../testing/environment";
import { createElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { describe, expect, it, vi } from "vitest";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { richDashboard } from "../testing/scenarios";
import {
  hrefsOf,
  installRenderHooks,
  recordedButtons,
  recordedPanel,
  renderHtml,
  textOf,
  useTestLocale,
} from "../testing/render";
import { NeedsAttentionPanel } from "./NeedsAttentionPanel";

installRenderHooks();

const render = (dashboard: HostDashboardResponse, onRetry: () => void = vi.fn()): string =>
  renderHtml(createElement(NeedsAttentionPanel, { dashboard, onRetry }));

interface ListedItem {
  title: string;
  count: string;
  href: string;
}

const itemsOf = (html: string): ListedItem[] =>
  [...html.matchAll(/<li><a [^>]*href="([^"]+)">(.*?)<\/a><\/li>/g)].map((match) => {
    const spans = [...match[2].matchAll(/<span class="[^"]*">([^<]+)<\/span>/g)].map((span) => span[1]);
    return { href: match[1], title: spans[0], count: spans[spans.length - 1] };
  });

const quiet = (): HostDashboardResponse =>
  makeDashboard({
    grading: ok({
      pendingAnswers: 0,
      aiScoringAnswers: 0,
      failedAnswers: 0,
      closedSessionsAwaitingFinalisation: 0,
      reportsAwaitingPublication: 0,
    }),
    subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: null, expiringSoon: false }),
    quota: ok({ used: 10, limit: 100, remaining: 90 }),
    support: ok({ open: 0, inProgress: 4, resolvedAwaitingClose: 9 }),
    billing: ok({ pendingOrders: 0 }),
  });

describe("NeedsAttentionPanel items", () => {
  it("lists every source in severity order with its count, unit and destination", () => {
    expect(itemsOf(render(richDashboard()))).toEqual([
      { title: "Answers that failed to score", count: "2", href: "/host/exams" },
      { title: "Answers waiting to be graded", count: "6", href: "/host/exams" },
      { title: "Closed sessions awaiting finalisation", count: "1", href: "/host/exams" },
      { title: "Subscription expiring soon", count: "7 days", href: "/host/billing" },
      { title: "Seat limit almost reached", count: "95%", href: "/host/billing" },
      { title: "Orders awaiting payment", count: "1", href: "/host/orders" },
      { title: "Reports awaiting publication", count: "2", href: "/host/exams" },
      { title: "Open support tickets", count: "2", href: "/host/support-tickets" },
    ]);
  });

  it("links the pending-orders item to the orders list, never to a payment page", () => {
    const hrefs = hrefsOf(render({ ...quiet(), billing: ok({ pendingOrders: 3 }) }));
    expect(hrefs).toEqual(["/host/orders"]);
  });

  it.each([
    {
      source: "failed answers",
      patch: { grading: ok({ pendingAnswers: 0, aiScoringAnswers: 0, failedAnswers: 4, closedSessionsAwaitingFinalisation: 0, reportsAwaitingPublication: 0 }) },
      expected: [{ title: "Answers that failed to score", count: "4" }],
    },
    {
      source: "grading backlog (waiting plus AI scoring)",
      patch: { grading: ok({ pendingAnswers: 3, aiScoringAnswers: 4, failedAnswers: 0, closedSessionsAwaitingFinalisation: 0, reportsAwaitingPublication: 0 }) },
      expected: [{ title: "Answers waiting to be graded", count: "7" }],
    },
    {
      source: "sessions awaiting finalisation",
      patch: { grading: ok({ pendingAnswers: 0, aiScoringAnswers: 0, failedAnswers: 0, closedSessionsAwaitingFinalisation: 2, reportsAwaitingPublication: 0 }) },
      expected: [{ title: "Closed sessions awaiting finalisation", count: "2" }],
    },
    {
      source: "reports awaiting publication",
      patch: { grading: ok({ pendingAnswers: 0, aiScoringAnswers: 0, failedAnswers: 0, closedSessionsAwaitingFinalisation: 0, reportsAwaitingPublication: 5 }) },
      expected: [{ title: "Reports awaiting publication", count: "5" }],
    },
    {
      source: "subscription expiring soon",
      patch: { subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 3, expiringSoon: true }) },
      expected: [{ title: "Subscription expiring soon", count: "3 days" }],
    },
    {
      source: "open support tickets",
      patch: { support: ok({ open: 6, inProgress: 0, resolvedAwaitingClose: 0 }) },
      expected: [{ title: "Open support tickets", count: "6" }],
    },
    {
      source: "pending orders",
      patch: { billing: ok({ pendingOrders: 8 }) },
      expected: [{ title: "Orders awaiting payment", count: "8" }],
    },
  ])("raises only the $source item when that is the only thing waiting", ({ patch, expected }) => {
    const items = itemsOf(render({ ...quiet(), ...patch }));
    expect(items.map(({ title, count }) => ({ title, count }))).toEqual(expected);
  });

  it("hides every item at zero, even though in-progress and resolved tickets exist", () => {
    const html = render(quiet());
    expect(itemsOf(html)).toEqual([]);
    expect(textOf(html)).toContain("Nothing needs your attention right now.");
  });

  it("hides the subscription item when the server does not flag it, however close the date", () => {
    const html = render({
      ...quiet(),
      subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: 2, expiringSoon: false }),
    });
    expect(itemsOf(html)).toEqual([]);
  });

  it("formats counts with the locale", () => {
    const big = { ...quiet(), billing: ok({ pendingOrders: 12345 }) };
    expect(itemsOf(render(big))[0].count).toBe("12,345");
    useTestLocale("vi");
    expect(itemsOf(render(big))[0].count).toBe("12.345");
  });

  it("is Vietnamese: titles and the day unit", () => {
    useTestLocale("vi");
    const items = itemsOf(render(richDashboard()));
    expect(items.map((item) => item.title)).toContain("Bài làm chấm điểm thất bại");
    expect(items.find((item) => item.href === "/host/billing")?.count).toBe("7 ngày");
    expect(textOf(render(richDashboard()))).not.toContain("Needs attention");
  });
});

describe("NeedsAttentionPanel with unavailable sources", () => {
  const SOURCES = [
    { source: "grading", hidden: ["Answers that failed to score", "Answers waiting to be graded", "Closed sessions awaiting finalisation", "Reports awaiting publication"] },
    { source: "subscription", hidden: ["Subscription expiring soon"] },
    { source: "quota", hidden: ["Seat limit almost reached"] },
    { source: "support", hidden: ["Open support tickets"] },
    { source: "billing", hidden: ["Orders awaiting payment"] },
  ] as const;

  it.each(SOURCES)("a failed $source source drops only its items and says the list may be incomplete", ({ source, hidden }) => {
    const html = render({ ...richDashboard(), [source]: failed() });
    const titles = itemsOf(html).map((item) => item.title);
    for (const title of hidden) expect(titles).not.toContain(title);
    expect(titles.length).toBe(8 - hidden.length);
    expect(textOf(html)).toContain("Some checks could not be loaded.");
    expect(recordedButtons("Try again")).toHaveLength(1);
  });

  it.each(SOURCES)("a forbidden $source source drops its items quietly", ({ source, hidden }) => {
    const html = render({ ...richDashboard(), [source]: forbidden() });
    const titles = itemsOf(html).map((item) => item.title);
    for (const title of hidden) expect(titles).not.toContain(title);
    expect(titles.length).toBe(8 - hidden.length);
    expect(textOf(html)).not.toContain("Some checks could not be loaded.");
    expect(html).not.toContain("<button");
  });

  it("the header retry of a partial failure refetches the single query", () => {
    const retry = vi.fn();
    render({ ...richDashboard(), billing: failed() }, retry);
    recordedButtons("Try again")[0].onClick?.();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("when every source failed the panel is its own error state, not an empty list", () => {
    const retry = vi.fn();
    const html = render(
      { ...richDashboard(), grading: failed(), subscription: failed(), quota: failed(), support: failed(), billing: failed() },
      retry,
    );
    expect(html).toContain('role="alert"');
    expect(itemsOf(html)).toEqual([]);
    expect(textOf(html)).not.toContain("Nothing needs your attention right now.");
    const panel = recordedPanel("Needs attention");
    expect(panel?.status).toBe("error");
    panel?.onRetry?.();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when no source is visible to this role", () => {
    const html = render({
      ...richDashboard(),
      grading: forbidden(),
      subscription: forbidden(),
      quota: forbidden(),
      support: forbidden(),
      billing: forbidden(),
    });
    expect(html).toBe("");
  });

  it("failed sources are still reported when the remaining ones have nothing to show", () => {
    const html = render({ ...quiet(), grading: failed() });
    expect(itemsOf(html)).toEqual([]);
    expect(textOf(html)).toContain("Some checks could not be loaded.");
  });
});
