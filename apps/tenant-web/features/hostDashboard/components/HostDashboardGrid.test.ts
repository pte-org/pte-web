import "../testing/environment";
import { createElement } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { failed } from "../testing/fixtures";
import {
  ACTOR_UUID,
  SESSION_ID,
  UNKNOWN_ACTION,
  richDashboard,
} from "../testing/scenarios";
import {
  attributeText,
  hrefsOf,
  isAllowedHref,
  muteRechartsSizeWarning,
  panelTitles,
  recordedPanel,
  regionOf,
  renderHtml,
  resetTestEnvironment,
  textOf,
} from "../testing/render";
import type { HostDashboardResponse } from "@pte/api-client";
import { HostDashboardGrid } from "./HostDashboardGrid";

let restoreConsole: () => void;
beforeAll(() => {
  restoreConsole = muteRechartsSizeWarning();
});
afterAll(() => restoreConsole());
afterEach(() => resetTestEnvironment());

const render = (dashboard: HostDashboardResponse, onRetry: () => void = () => undefined): string =>
  renderHtml(createElement(HostDashboardGrid, { dashboard, onRetry }));

const EXPECTED_TITLES_EN = [
  "Needs attention",
  "Key figures",
  "Seats and subscription",
  "Attempts submitted",
  "Upcoming sessions",
  "Recent activity",
  "Sessions by status",
  "Learner assignment",
  "Grading pipeline",
  "Staff coverage",
  "Academic structure",
  "Support tickets",
  "Pending orders",
];

describe("HostDashboardGrid with every section loaded", () => {
  let html = "";
  beforeAll(() => {
    html = render(richDashboard());
  });

  it("renders every widget with its heading, needs attention first in the DOM (mobile order)", () => {
    expect(panelTitles(html)).toEqual(EXPECTED_TITLES_EN);
  });

  it("gives every panel a named region and uses h2 only (the page h1 belongs to the header)", () => {
    const regionIds = [...html.matchAll(/role="region" aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
    expect(regionIds).toHaveLength(EXPECTED_TITLES_EN.length - 1); // the key figures use a <section>
    for (const id of regionIds) expect(html).toContain(`<h2 id="${id}"`);
    expect(html).not.toMatch(/<h1[\s>]/);
  });

  it("keeps the needs-attention slot unordered below md and orders the others from md up", () => {
    const attention = regionOf(html, "Needs attention") ?? "";
    const classes = /^<div role="region"[^>]*class="([^"]*)"/.exec(attention)?.[1] ?? "";
    expect(classes.split(" ").some((name) => name.startsWith("order-"))).toBe(false);
    expect(classes).toContain("md:order-");
  });

  it("links only to existing host routes and the session row to its detail page", () => {
    const hrefs = hrefsOf(html);
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => !isAllowedHref(href))).toEqual([]);
    expect(hrefs).toContain(`/host/exams/${SESSION_ID}`);
  });

  it("uses no inline style (except recharts' own sizing wrapper), hex or functional colors", () => {
    const styles = [...html.matchAll(/\sstyle="([^"]*)"/g)].map((match) => match[1]);
    const rechartsOnly = new Set(["width:100%;height:100%;min-width:0", "width:0;height:0;overflow:visible"]);
    expect(styles.filter((style) => !rechartsOnly.has(style))).toEqual([]);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/);
  });

  it("never shows machine strings: enum codes, audit codes, ids or unresolved placeholders", () => {
    const visible = [textOf(html), ...attributeText(html)].join(" ");
    expect(visible).not.toMatch(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/);
    expect(visible).not.toMatch(/\b(?:DRAFT|PREPARING|READY|SCHEDULED|OPEN|CLOSED|CANCELLED|ACTIVE|EXPIRED|PENDING)\b/);
    for (const raw of ["ExamPublished", "ClassCreated", "ExamSession", UNKNOWN_ACTION, ACTOR_UUID]) {
      expect(html).not.toContain(raw);
    }
    expect(visible).not.toMatch(/[{}]/);
  });

  it("states the actor only as a generic role: staff member or system", () => {
    const activity = textOf(regionOf(html, "Recent activity") ?? "");
    expect(activity.match(/Staff member/g)).toHaveLength(2);
    expect(activity.match(/System/g)).toHaveLength(1);
    expect(activity).toContain("Activity recorded"); // the unknown code
  });
});

interface ErrorCase {
  section: keyof HostDashboardResponse;
  /** Panels (by heading) that must switch to their own error state. */
  panels: string[];
}

const ERROR_CASES: ErrorCase[] = [
  { section: "learners", panels: ["Learner assignment"] },
  { section: "academics", panels: ["Academic structure"] },
  { section: "staff", panels: ["Staff coverage"] },
  { section: "exams", panels: ["Upcoming sessions", "Sessions by status"] },
  { section: "attempts", panels: ["Attempts submitted"] },
  { section: "grading", panels: ["Grading pipeline"] },
  { section: "billing", panels: ["Pending orders"] },
  { section: "support", panels: ["Support tickets"] },
  { section: "recentActivity", panels: ["Recent activity"] },
];

describe("a failed section shows only its own error state", () => {
  it.each(ERROR_CASES)("$section: $panels", ({ section, panels }) => {
    const retry = vi.fn();
    const html = render({ ...richDashboard(), [section]: failed() }, retry);
    for (const title of panels) {
      const region = regionOf(html, title) ?? "";
      expect(region, title).toContain('role="alert"');
      expect(textOf(region), title).toContain("This section is unavailable");
      expect(textOf(region), title).toContain("Try again");
      expect(region, title).toContain("<button");
      expect(region, `${title} must not link to a screen that cannot load`).not.toContain("<a ");
    }
    // every other panel keeps rendering its content
    const others = panelTitles(html).filter((title) => !panels.includes(title));
    for (const title of others) {
      expect(regionOf(html, title) ?? "<section", title).not.toContain("This section is unavailable");
    }
  });

  it("retry of a failed panel refetches the single dashboard query", () => {
    const retry = vi.fn();
    render({ ...richDashboard(), support: failed() }, retry);
    const panel = recordedPanel("Support tickets");
    expect(panel?.status).toBe("error");
    panel?.onRetry?.();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("an OK sibling stays intact while one section fails (exams ERROR keeps the learner donut)", () => {
    const html = render({ ...richDashboard(), exams: failed() });
    expect(textOf(regionOf(html, "Learner assignment") ?? "")).toContain("In a class");
    expect(textOf(html)).not.toContain("Mock test 1");
  });

  it("failed quota keeps the subscription half and failed subscription keeps the seats half", () => {
    const quotaFailed = render({ ...richDashboard(), quota: failed() });
    const usageA = textOf(regionOf(quotaFailed, "Seats and subscription") ?? "");
    expect(usageA).toContain("This section is unavailable");
    expect(usageA).toContain("Exam package 100");
    expect(usageA).not.toContain("seats remaining");

    const subscriptionFailed = render({ ...richDashboard(), subscription: failed() });
    const usageB = textOf(regionOf(subscriptionFailed, "Seats and subscription") ?? "");
    expect(usageB).toContain("This section is unavailable");
    expect(usageB).toContain("95 of 100 seats");
    expect(usageB).not.toContain("Exam package 100");
  });

  it("both seats and subscription failing turns the whole usage panel into one error state", () => {
    const html = render({ ...richDashboard(), quota: failed(), subscription: failed() });
    const usage = regionOf(html, "Seats and subscription") ?? "";
    expect(usage).toContain('role="alert"');
    expect(textOf(usage).match(/This section is unavailable/g)).toHaveLength(1);
  });

  it("key figures mark the cards of a failed section as unavailable with a retry in the header", () => {
    const html = render({ ...richDashboard(), learners: failed() });
    expect(html).toContain("Unavailable");
    expect(textOf(html).match(/Unavailable/g)).toHaveLength(2); // Learners and Active learners
  });
});
