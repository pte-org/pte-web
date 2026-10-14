import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  countMatches,
  findOpeningTag,
  innerOf,
  muteRechartsSizeWarning,
  renderHtml,
  textOf,
} from "../testing/renderHtml";
import { TrendBarChart } from "./TrendBarChart";
import { TrendLineChart } from "./TrendLineChart";
import type { TrendChartBaseProps, TrendChartDatum, TrendChartSeries } from "./trendChartShared";

// recharts' ResponsiveContainer has no size on the server, so the plot itself renders nothing.
// These tests pin what IS deterministic: wrapper, legend, screen-reader table and empty state.
let restoreConsole: () => void;
beforeAll(() => {
  restoreConsole = muteRechartsSizeWarning();
});
afterAll(() => restoreConsole());

const SERIES: TrendChartSeries[] = [
  { key: "paid", label: "Paid", tone: "success" },
  { key: "failed", label: "Failed", tone: "danger" },
];
const DATA: TrendChartDatum[] = [
  { label: "Aug", paid: 1000000, failed: 2 },
  { label: "Sep", paid: 2500000, failed: 0 },
  { label: "Oct", paid: 400000, failed: 1, partial: true },
];

const BASE: TrendChartBaseProps = {
  data: DATA,
  series: SERIES,
  ariaLabel: "Payments per month",
  emptyLabel: "No payments yet",
};

type ChartComponent = (props: TrendChartBaseProps) => ReactElement;
const CHARTS: ReadonlyArray<readonly [string, ChartComponent]> = [
  ["TrendBarChart", TrendBarChart],
  ["TrendLineChart", TrendLineChart],
];

describe.each(CHARTS)("%s (server render)", (_name, Chart) => {
  const render = (overrides: Partial<TrendChartBaseProps> = {}): string =>
    renderHtml(<Chart {...BASE} {...overrides} />);

  it("exposes the plot as role=img named by ariaLabel", () => {
    const tag = findOpeningTag(render(), "div", 'role="img"') ?? "";
    expect(tag).toContain('aria-label="Payments per month"');
  });

  it("sizes the plot with h-64 by default and honours chartClassName", () => {
    expect(findOpeningTag(render(), "div", 'role="img"')).toContain("h-64");
    const tag = findOpeningTag(render({ chartClassName: "h-80" }), "div", 'role="img"') ?? "";
    expect(tag).toContain("h-80");
    expect(tag).not.toContain("h-64");
  });

  it("wraps the plot in recharts' responsive container", () => {
    expect(render()).toContain("recharts-responsive-container");
  });

  it("lists every series label in the visible legend, in order, with decorative dots", () => {
    const legend = innerOf(render(), "ul") ?? "";
    expect(countMatches(legend, /<li /)).toBe(2);
    expect(textOf(legend)).toBe("Paid Failed");
    expect(legend.indexOf("Paid")).toBeLessThan(legend.indexOf("Failed"));
    expect(countMatches(legend, /<span aria-hidden="true"/)).toBe(2);
    expect(legend).toContain("bg-[var(--mint-action)]");
    expect(legend).toContain("bg-[var(--blush-action)]");
  });

  it("falls back to the brand tone when a series has no tone", () => {
    const legend = innerOf(render({ series: [{ key: "paid", label: "Paid" }] }), "ul") ?? "";
    expect(legend).toContain("bg-[var(--action)]");
  });

  it("adds a partial legend item only when a point is partial AND partialLabel is given", () => {
    const withLabel = innerOf(render({ partialLabel: "Month in progress" }), "ul") ?? "";
    expect(countMatches(withLabel, /<li /)).toBe(3);
    expect(withLabel).toContain("opacity-45");
    expect(textOf(withLabel)).toBe("Paid Failed Month in progress");

    const noLabel = innerOf(render(), "ul") ?? "";
    expect(countMatches(noLabel, /<li /)).toBe(2);
    expect(noLabel).not.toContain("opacity-45");

    const noPartialPoint = innerOf(
      render({ partialLabel: "Month in progress", data: DATA.map(({ partial: _partial, ...rest }) => rest) }),
      "ul",
    ) ?? "";
    expect(countMatches(noPartialPoint, /<li /)).toBe(2);
    expect(noPartialPoint).not.toContain("Month in progress");
  });

  describe("screen-reader table", () => {
    it("is sr-only, captioned with ariaLabel and has one column header per series", () => {
      const html = render();
      expect(html).toContain('<table class="sr-only"><caption>Payments per month</caption>');
      const head = innerOf(html, "thead") ?? "";
      expect(head).toContain("<td></td>");
      expect(head).toContain('<th scope="col">Paid</th>');
      expect(head).toContain('<th scope="col">Failed</th>');
      expect(countMatches(head, /<th /)).toBe(2);
    });

    it("has one body row per datum, in data order, with the label as row header", () => {
      const body = innerOf(render(), "tbody") ?? "";
      expect(countMatches(body, /<tr>/)).toBe(3);
      expect(countMatches(body, /<th scope="row">/)).toBe(3);
      expect(body.indexOf("Aug")).toBeLessThan(body.indexOf("Sep"));
      expect(body.indexOf("Sep")).toBeLessThan(body.indexOf("Oct"));
      expect(body).toContain("<td>1000000</td>");
      expect(body).toContain("<td>2500000</td>");
    });

    it("passes every cell through valueFormatter", () => {
      const body = innerOf(render({ valueFormatter: (value) => `${value / 1000}k VND` }), "tbody") ?? "";
      expect(body).toContain("<td>1000k VND</td>");
      expect(body).toContain("<td>0k VND</td>");
      expect(countMatches(body, /<td>/)).toBe(6);
    });

    it("annotates partial rows with partialLabel, and only those rows", () => {
      const body = innerOf(render({ partialLabel: "in progress" }), "tbody") ?? "";
      expect(body).toContain('<th scope="row">Oct (in progress)</th>');
      expect(body).toContain('<th scope="row">Aug</th>');
      expect(countMatches(body, /in progress/)).toBe(1);
    });

    it("leaves a partial row unannotated without partialLabel", () => {
      expect(innerOf(render(), "tbody")).toContain('<th scope="row">Oct</th>');
    });

    it("renders missing or non-finite values as the formatted zero", () => {
      const body =
        innerOf(
          render({ data: [{ label: "Aug", paid: 5 }, { label: "Sep", paid: Number.NaN, failed: 3 }] }),
          "tbody",
        ) ?? "";
      expect(body).toContain("<tr><th scope=\"row\">Aug</th><td>5</td><td>0</td></tr>");
      expect(body).toContain("<tr><th scope=\"row\">Sep</th><td>0</td><td>3</td></tr>");
    });
  });

  describe("empty state", () => {
    const emptyCases: ReadonlyArray<readonly [string, Partial<TrendChartBaseProps>]> = [
      ["no data", { data: [] }],
      ["all-zero data", { data: [{ label: "Aug", paid: 0, failed: 0 }, { label: "Sep", paid: 0 }] }],
      ["an empty series list", { series: [] }],
      ["only non-finite values", { data: [{ label: "Aug", paid: Number.NaN }] }],
    ];

    it.each(emptyCases)("shows emptyLabel for %s", (_label, overrides) => {
      const html = render(overrides);
      expect(textOf(html)).toBe("No payments yet");
    });

    it.each(emptyCases)("exposes emptyLabel to assistive technology for %s (no image role)", (_label, overrides) => {
      const html = render(overrides);
      expect(findOpeningTag(html, "div", 'role="status"')).toBeDefined();
      expect(html).not.toContain('role="img"');
      expect(html).not.toContain("aria-label");
      expect(html).not.toContain("aria-hidden");
    });

    it.each(emptyCases)("renders no plot, legend or table for %s", (_label, overrides) => {
      const html = render(overrides);
      expect(html).not.toContain("recharts");
      expect(html).not.toContain("<table");
      expect(html).not.toContain("<ul");
    });

    it("keeps className on the empty placeholder", () => {
      expect(render({ data: [], className: "mt-4" })).toContain("mt-4");
    });

    it("is not shown when at least one value is non-zero", () => {
      expect(render({ data: [{ label: "Aug", paid: 0 }, { label: "Sep", failed: 1 }] })).not.toContain(
        "No payments yet",
      );
    });
  });

  it("never emits an inline style outside recharts' own sizing container, nor any animation", () => {
    const html = render({ partialLabel: "in progress" });
    const styles = [...html.matchAll(/style="([^"]*)"/g)].map((match) => match[1] ?? "");
    expect(styles.every((style) => !/animation|transition/.test(style))).toBe(true);
    expect(html).not.toMatch(/<(ul|table|caption|th|td)[^>]*style=/);
    expect(findOpeningTag(html, "div", 'role="img"')).not.toContain("style=");
    expect(html).not.toContain("animate-");
    expect(html).not.toContain("recharts-animation");
  });

  it("uses only theme CSS variables for color (no hex or rgb literals)", () => {
    expect(render({ partialLabel: "x" })).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(/);
  });
});
