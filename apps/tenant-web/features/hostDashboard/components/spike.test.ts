import "../testing/environment";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { makeDashboard } from "../testing/fixtures";
import { hrefsOf, muteRechartsSizeWarning, renderHtml, textOf, useTestLocale } from "../testing/render";
import { HostDashboardGrid } from "./HostDashboardGrid";
import { HostDashboardHeader } from "./HostDashboardHeader";

describe("spike", () => {
  it("renders", () => {
    const restore = muteRechartsSizeWarning();
    const html = renderHtml(createElement(HostDashboardGrid, { dashboard: makeDashboard(), onRetry: () => undefined }));
    console.log(textOf(html));
    console.log(hrefsOf(html));
    console.log(html.match(/<h[1-6][^>]*>[^<]*/g));
    useTestLocale("vi");
    const vi_ = renderHtml(createElement(HostDashboardGrid, { dashboard: makeDashboard(), onRetry: () => undefined }));
    console.log(textOf(vi_));
    console.log(textOf(renderHtml(createElement(HostDashboardHeader))));
    restore();
    expect(html).toContain("Needs attention");
  });
});
