import type { ReactElement } from "react";
import type { TooltipContentProps } from "recharts";
import { describe, expect, it } from "vitest";
import { findOpeningTag, renderHtml, textOf } from "../testing/renderHtml";
import { CHART_TONE_COLORS } from "./chartTones";
import {
  createTooltipRenderer,
  DEFAULT_CHART_HEIGHT_CLASS,
  DEFAULT_VALUE_FORMATTER,
  hasTrendData,
  PARTIAL_DASH,
  PARTIAL_FILL_OPACITY,
  readSeriesValue,
  toneColor,
  TrendChartFrame,
  type TrendChartDatum,
  type TrendChartSeries,
} from "./trendChartShared";

const SERIES: TrendChartSeries[] = [
  { key: "paid", label: "Paid", tone: "success" },
  { key: "failed", label: "Failed", tone: "danger" },
];

describe("trendChartShared constants", () => {
  it("pins the documented defaults", () => {
    expect(DEFAULT_CHART_HEIGHT_CLASS).toBe("h-64");
    expect(PARTIAL_DASH).toBe("4 3");
    expect(PARTIAL_FILL_OPACITY).toBeGreaterThan(0);
    expect(PARTIAL_FILL_OPACITY).toBeLessThan(1);
    expect(DEFAULT_VALUE_FORMATTER(1234)).toBe("1234");
  });
});

describe("toneColor", () => {
  it("maps the series tone through CHART_TONE_COLORS and defaults to brand", () => {
    expect(toneColor({ key: "a", label: "A", tone: "danger" })).toBe(CHART_TONE_COLORS.danger);
    expect(toneColor({ key: "a", label: "A" })).toBe(CHART_TONE_COLORS.brand);
    expect(toneColor({ key: "a", label: "A" })).toBe("var(--action)");
  });
});

describe("readSeriesValue (data normalisation)", () => {
  it("returns finite numbers as they are, including negatives and zero", () => {
    expect(readSeriesValue({ label: "x", a: 5 }, "a")).toBe(5);
    expect(readSeriesValue({ label: "x", a: -3.5 }, "a")).toBe(-3.5);
    expect(readSeriesValue({ label: "x", a: 0 }, "a")).toBe(0);
  });

  it.each([
    ["missing key", { label: "x" } as TrendChartDatum],
    ["undefined", { label: "x", a: undefined } as TrendChartDatum],
    ["NaN", { label: "x", a: Number.NaN } as TrendChartDatum],
    ["Infinity", { label: "x", a: Number.POSITIVE_INFINITY } as TrendChartDatum],
    ["string", { label: "x", a: "7" } as TrendChartDatum],
    ["boolean", { label: "x", a: true } as TrendChartDatum],
  ])("normalises %s to 0", (_name, datum) => {
    expect(readSeriesValue(datum, "a")).toBe(0);
  });

  it("does not treat the reserved label/partial keys specially unless asked", () => {
    expect(readSeriesValue({ label: "Jan", partial: true }, "label")).toBe(0);
    expect(readSeriesValue({ label: "Jan", partial: true }, "partial")).toBe(0);
  });
});

describe("hasTrendData (all-zero detection)", () => {
  it("is false for no data, no series, all zeros and non-finite values", () => {
    expect(hasTrendData([], SERIES)).toBe(false);
    expect(hasTrendData([{ label: "Jan", paid: 3 }], [])).toBe(false);
    expect(hasTrendData([{ label: "Jan", paid: 0, failed: 0 }, { label: "Feb" }], SERIES)).toBe(false);
    expect(hasTrendData([{ label: "Jan", paid: Number.NaN }], SERIES)).toBe(false);
  });

  it("is true when any series value of any point is non-zero (negatives count)", () => {
    expect(hasTrendData([{ label: "Jan", paid: 0 }, { label: "Feb", failed: 1 }], SERIES)).toBe(true);
    expect(hasTrendData([{ label: "Jan", paid: -2 }], SERIES)).toBe(true);
  });

  it("ignores values under keys that are not in the series list", () => {
    expect(hasTrendData([{ label: "Jan", other: 9 }], SERIES)).toBe(false);
  });
});

describe("createTooltipRenderer", () => {
  // recharts passes many more fields; the renderer only reads `active` and `label`.
  const props = (active: boolean, label: string): TooltipContentProps =>
    ({ active, label }) as unknown as TooltipContentProps;
  const data: TrendChartDatum[] = [
    { label: "Jan", paid: 1500, failed: 2 },
    { label: "Feb", paid: 3, failed: 0, partial: true },
  ];
  const render = (active: boolean, label: string, partialLabel?: string): string => {
    const content = createTooltipRenderer({
      data,
      series: SERIES,
      formatValue: (value) => `${value} VND`,
      partialLabel,
    })(props(active, label));
    return content === null ? "" : renderHtml(content as ReactElement);
  };

  it("renders the label and one formatted line per series", () => {
    const html = render(true, "Jan");
    expect(textOf(html)).toBe("Jan Paid 1500 VND Failed 2 VND");
  });

  it("adds the partial caption only for a partial datum with a partialLabel", () => {
    expect(textOf(render(true, "Feb", "In progress"))).toContain("In progress");
    expect(textOf(render(true, "Feb"))).not.toContain("In progress");
    expect(textOf(render(true, "Jan", "In progress"))).not.toContain("In progress");
  });

  it("returns null when inactive or when the label is unknown", () => {
    const renderer = createTooltipRenderer({ data, series: SERIES, formatValue: String });
    expect(renderer(props(false, "Jan"))).toBeNull();
    expect(renderer(props(true, "Mar"))).toBeNull();
  });
});

describe("TrendChartFrame", () => {
  const data: TrendChartDatum[] = [
    { label: "Jan", paid: 10, failed: 1 },
    { label: "Feb", paid: 20, failed: 2, partial: true },
  ];
  const frame = (overrides: Partial<Parameters<typeof TrendChartFrame>[0]> = {}): string =>
    renderHtml(
      <TrendChartFrame data={data} series={SERIES} ariaLabel="Payments" emptyLabel="No payments" {...overrides}>
        <span data-child="plot" />
      </TrendChartFrame>,
    );

  it("renders children only inside the role=img plot and never an empty message", () => {
    const html = frame();
    const plot = html.match(/<div role="img"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";
    expect(plot).toContain('aria-label="Payments"');
    expect(plot).toContain('<span data-child="plot"></span>');
    expect(html).not.toContain("No payments");
  });

  it("keeps the data table a sibling of the image role so it stays reachable", () => {
    const html = frame();
    const plot = html.match(/<div role="img"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";
    expect(plot).not.toContain("<table");
    expect(html).toContain('<table class="sr-only">');
  });

  it("applies default and overridden height classes to the plot only", () => {
    expect(findOpeningTag(frame(), "div", 'role="img"')).toContain("w-full min-w-0 h-64");
    const overridden = findOpeningTag(frame({ chartClassName: "h-96" }), "div", 'role="img"') ?? "";
    expect(overridden).toContain("h-96");
    expect(overridden).not.toContain("h-64");
  });

  it("applies className to the outer wrapper", () => {
    expect(frame({ className: "xl:col-span-2" })).toMatch(/^<div class="flex min-w-0 flex-col gap-3 xl:col-span-2"/);
  });

  it("uses the default String formatter in the table unless valueFormatter is given", () => {
    expect(frame()).toContain("<td>10</td>");
    expect(frame({ valueFormatter: (value) => `${value}!` })).toContain("<td>10!</td>");
  });

  it("uses the empty state, without children, table or legend, when there is nothing to plot", () => {
    for (const empty of [{ data: [] }, { series: [] }, { data: [{ label: "Jan", paid: 0 }] }]) {
      const html = frame(empty);
      // role="img" would make the empty text presentational, so it is plain status content.
      expect(html).toContain('role="status"');
      expect(html).not.toContain('role="img"');
      expect(html).not.toContain("aria-label");
      expect(textOf(html)).toBe("No payments");
      expect(html).not.toContain("data-child");
      expect(html).not.toContain("<table");
      expect(html).not.toContain("<ul");
    }
  });
});
