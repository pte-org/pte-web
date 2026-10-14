import "../testing/environment";
import { createElement } from "react";
import type { DashboardUpcomingSession, HostDashboardResponse, SessionStatus } from "@pte/api-client";
import { describe, expect, it, vi } from "vitest";
import { failed, forbidden, makeDashboard, ok } from "../testing/fixtures";
import { SESSION_ID } from "../testing/scenarios";
import { hrefsOf, installRenderHooks, renderHtml, textOf, useTestLocale } from "../testing/render";
import { UpcomingSessionsPanel } from "./UpcomingSessionsPanel";

installRenderHooks();

const session = (overrides: Partial<DashboardUpcomingSession> = {}): DashboardUpcomingSession => ({
  publicId: SESSION_ID,
  name: "Mock test 1",
  status: "SCHEDULED",
  opensAt: "2026-10-20T01:00:00Z",
  closesAt: "2026-10-20T03:00:00Z",
  enrolled: 30,
  capacity: 40,
  ...overrides,
});

const withSessions = (
  upcoming: DashboardUpcomingSession[],
  zone = "Asia/Ho_Chi_Minh",
): HostDashboardResponse => {
  const base = makeDashboard();
  const byStatus = base.exams.status === "OK" ? base.exams.data.byStatus : undefined;
  if (!byStatus) throw new Error("fixture exams must be OK");
  return {
    ...base,
    meta: { ...base.meta, zone },
    exams: ok({ byStatus, created: { current: 1, previous: 1, changePct: 0 }, upcoming }),
  };
};

const render = (dashboard: HostDashboardResponse): string =>
  renderHtml(createElement(UpcomingSessionsPanel, { dashboard, onRetry: vi.fn() }));

const headers = (html: string): string[] =>
  [...html.matchAll(/<th [^>]*><button [^>]*><span>([^<]*)<\/span>/g)].map((match) => match[1]);

const cells = (html: string): string[][] =>
  [...html.matchAll(/<tr class="not-last[^>]*>(.*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<td [^>]*>(.*?)<\/td>/g)].map((cell) => textOf(cell[1])),
  );

describe("UpcomingSessionsPanel table", () => {
  it("has exactly the five columns and no Branch column (English)", () => {
    const html = render(withSessions([session()]));
    expect(headers(html)).toEqual(["Session", "Status", "Opens", "Closes", "Enrolled / capacity"]);
    expect(textOf(html)).not.toMatch(/branch/i);
  });

  it("has exactly the five columns and no Branch column (Vietnamese)", () => {
    useTestLocale("vi");
    const html = render(withSessions([session()]));
    expect(headers(html)).toEqual(["Kỳ thi", "Trạng thái", "Mở lúc", "Đóng lúc", "Đã ghi danh / sức chứa"]);
    expect(textOf(html)).not.toMatch(/chi nhánh|branch/i);
  });

  it("links the session name to its detail page and nothing else in the row", () => {
    const html = render(withSessions([session()]));
    const tableLinks = hrefsOf(html).filter((href) => href.startsWith("/host/exams/"));
    expect(tableLinks).toEqual([`/host/exams/${SESSION_ID}`]);
    expect(html).toContain(`href="/host/exams/${SESSION_ID}">Mock test 1</a>`);
  });

  it("shows a dash for a missing capacity and for an invalid close time", () => {
    const html = render(withSessions([session({ capacity: null, closesAt: "not-a-date", enrolled: 12 })]));
    const [row] = cells(html);
    expect(row[3]).toBe("–");
    expect(row[4]).toBe("12 / –");
  });

  it("shows capacity zero as 0, not as a dash", () => {
    const [row] = cells(render(withSessions([session({ capacity: 0, enrolled: 0 })])));
    expect(row[4]).toBe("0 / 0");
  });

  it("formats enrolled and capacity with the locale", () => {
    const rich = withSessions([session({ enrolled: 1234, capacity: 5000 })]);
    expect(cells(render(rich))[0][4]).toBe("1,234 / 5,000");
    useTestLocale("vi");
    expect(cells(render(rich))[0][4]).toBe("1.234 / 5.000");
  });

  it("labels every status with copy, never the enum code", () => {
    const statuses: SessionStatus[] = ["DRAFT", "PREPARING", "READY", "SCHEDULED", "OPEN", "CLOSED", "CANCELLED"];
    const html = render(
      withSessions(statuses.map((status, index) => session({ publicId: `${SESSION_ID.slice(0, -1)}${index}`, status }))),
    );
    expect(cells(html).map((row) => row[1])).toEqual([
      "Draft",
      "Preparing",
      "Ready",
      "Scheduled",
      "Open",
      "Closed",
      "Cancelled",
    ]);
    expect(html).not.toMatch(/>(?:DRAFT|PREPARING|READY|SCHEDULED|OPEN|CLOSED|CANCELLED)</);
  });

  it("shows at most eight sessions", () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      session({ publicId: `${SESSION_ID.slice(0, -2)}${String(index).padStart(2, "0")}`, name: `Session ${index}` }),
    );
    const rows = cells(render(withSessions(many)));
    expect(rows).toHaveLength(8);
    expect(rows[0][0]).toBe("Session 0");
    expect(rows[7][0]).toBe("Session 7");
  });
});

describe("UpcomingSessionsPanel time display", () => {
  it("shows ISO instants in the dashboard zone (Asia/Ho_Chi_Minh, UTC+7)", () => {
    const [row] = cells(render(withSessions([session()])));
    expect(row[2]).toBe("Oct 20, 2026, 8:00 AM");
    expect(row[3]).toBe("Oct 20, 2026, 10:00 AM");
  });

  it("follows the zone the server reports", () => {
    const [row] = cells(render(withSessions([session()], "UTC")));
    expect(row[2]).toBe("Oct 20, 2026, 1:00 AM");
  });

  it("moves an instant late on the 31st to the 1st of the next month and year in Ho Chi Minh time", () => {
    const [monthEnd, yearEnd] = cells(
      render(
        withSessions([
          session({ opensAt: "2026-10-31T17:30:00Z" }),
          session({ publicId: "22222222-2222-4222-8222-222222222222", opensAt: "2026-12-31T17:00:00Z" }),
        ]),
      ),
    );
    expect(monthEnd[2]).toBe("Nov 1, 2026, 12:30 AM");
    expect(yearEnd[2]).toBe("Jan 1, 2027, 12:00 AM");
  });

  it("keeps the same instant on the previous day when the zone is UTC", () => {
    const [row] = cells(render(withSessions([session({ opensAt: "2026-10-31T17:30:00Z" })], "UTC")));
    expect(row[2]).toBe("Oct 31, 2026, 5:30 PM");
  });

  it("formats dates the Vietnamese way", () => {
    useTestLocale("vi");
    const [row] = cells(render(withSessions([session()])));
    expect(row[2]).toBe("08:00 20 thg 10, 2026");
  });
});

describe("UpcomingSessionsPanel states", () => {
  it("shows the empty state, without a table, when nothing is scheduled", () => {
    const html = render(withSessions([]));
    expect(textOf(html)).toContain("No upcoming sessions");
    expect(textOf(html)).toContain("Create an exam session and it will appear here.");
    expect(html).not.toContain("<table");
    expect(hrefsOf(html)).toEqual(["/host/exams"]);
  });

  it("shows its own error state with a retry for a failed section", () => {
    const html = render({ ...makeDashboard(), exams: failed() });
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<table");
    expect(hrefsOf(html)).toEqual([]);
  });

  it("renders nothing for a forbidden section", () => {
    expect(render({ ...makeDashboard(), exams: forbidden() })).toBe("");
  });
});
