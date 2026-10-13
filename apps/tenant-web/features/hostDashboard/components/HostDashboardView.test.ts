import { LEARNERS_OVERVIEW_MARKER } from "../testing/environment";
import { createElement } from "react";
import { ApiError } from "@pte/api-client";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}));

vi.mock("../api", () => ({ useHostDashboard: () => query.current }));

import { makeDashboard } from "../testing/fixtures";
import {
  muteRechartsSizeWarning,
  panelTitles,
  recordedButtons,
  renderHtml,
  resetTestEnvironment,
  textOf,
  useTestLocale,
} from "../testing/render";
import { HostDashboardView } from "./HostDashboardView";

let restoreConsole: () => void;
beforeAll(() => {
  restoreConsole = muteRechartsSizeWarning();
});
afterAll(() => restoreConsole());
afterEach(() => resetTestEnvironment());

const setQuery = (result: Record<string, unknown>): void => {
  query.current = { data: undefined, error: null, isPending: false, isFetching: false, refetch: vi.fn(), ...result };
};

const render = (): string => renderHtml(createElement(HostDashboardView));

describe("HostDashboardView", () => {
  it("shows the overview loading state under the header while the single query is pending", () => {
    setQuery({ isPending: true });
    const html = render();
    expect(html).toContain('role="status"');
    expect(textOf(html)).toContain("Loading your overview");
    expect(textOf(html)).toContain("Overview"); // page title stays visible
    expect(panelTitles(html)).toEqual([]);
    expect(html).not.toContain('role="alert"');
  });

  it("renders the grid and keeps LearnersOverview as the last, full-width child", () => {
    setQuery({ data: makeDashboard() });
    const html = render();
    expect(panelTitles(html)).toContain("Needs attention");
    const markerAt = html.indexOf(LEARNERS_OVERVIEW_MARKER);
    expect(markerAt).toBeGreaterThan(html.lastIndexOf("</h2>"));
    expect(html).toMatch(new RegExp(`${LEARNERS_OVERVIEW_MARKER}</section></div>$`));
    expect(html.match(new RegExp(LEARNERS_OVERVIEW_MARKER, "g"))!.length).toBe(2); // aria-label + text, one section
  });

  it("shows the page header with its three quick actions before the widgets", () => {
    setQuery({ data: makeDashboard() });
    const html = render();
    const header = html.indexOf("Overview");
    expect(header).toBeGreaterThanOrEqual(0);
    expect(header).toBeLessThan(html.indexOf("Needs attention"));
    for (const label of ["Add learners", "Create exam session", "Plans &amp; billing"]) {
      expect(html).toContain(label);
    }
  });

  it("shows a whole-page error with a retry when there is no data, and still mounts LearnersOverview", () => {
    setQuery({ error: new Error("boom"), isPending: false });
    const html = render();
    const text = textOf(html);
    expect(text).toContain("Unable to load the overview");
    expect(text).toContain("Something went wrong while loading your overview. Please try again.");
    expect(text).toContain("Try again");
    expect(panelTitles(html)).toEqual([]);
    expect(html).toContain(LEARNERS_OVERVIEW_MARKER);
  });

  it("retry of the whole-page error refetches the one query", () => {
    const refetch = vi.fn();
    setQuery({ error: new Error("boom"), refetch });
    render();
    const [retry] = recordedButtons("Try again");
    retry.onClick?.();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: "a machine code in the message",
      error: new ApiError("conflict", 409, "PLAN_ARCHIVED_NOT_EDITABLE", undefined, { code: "PLAN_ARCHIVED_NOT_EDITABLE" }),
      shown: "This plan is archived and can no longer be edited.",
      hidden: "PLAN_ARCHIVED_NOT_EDITABLE",
    },
    {
      name: "a server failure with a stack trace",
      error: new ApiError("server", 500, "NullPointerException at Dashboard.build(Dashboard.java:42)"),
      shown: "The server encountered a problem. Please try again later.",
      hidden: "NullPointerException",
    },
    {
      name: "a network failure",
      error: new ApiError("network", 0, "fetch failed: ECONNREFUSED"),
      shown: "Unable to connect to the server.",
      hidden: "ECONNREFUSED",
    },
    {
      name: "a plain Error",
      error: new Error("TypeError: Cannot read properties of undefined"),
      shown: "Something went wrong while loading your overview. Please try again.",
      hidden: "TypeError",
    },
  ])("takes the error text from the user-facing helper for $name", ({ error, shown, hidden }) => {
    setQuery({ error });
    const html = render();
    expect(textOf(html)).toContain(shown);
    expect(html).not.toContain(hidden);
  });

  it("keeps the widgets when a background refetch fails but earlier data exists", () => {
    setQuery({ data: makeDashboard(), error: new ApiError("network", 0, "offline") });
    const html = render();
    expect(panelTitles(html)).toContain("Needs attention");
    expect(textOf(html)).not.toContain("Unable to load the overview");
  });

  it("renders in Vietnamese: loading label, error copy and retry", () => {
    useTestLocale("vi");
    setQuery({ isPending: true });
    expect(textOf(render())).toContain("Đang tải tổng quan");
    setQuery({ error: new Error("boom") });
    const text = textOf(render());
    expect(text).toContain("Không thể tải tổng quan");
    expect(text).toContain("Thử lại");
    expect(text).not.toContain("Try again");
  });
});
