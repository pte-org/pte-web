import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHtml, textOf } from "../testing/renderHtml";
import { TrendBarChart } from "./TrendBarChart";
import { TrendLineChart } from "./TrendLineChart";
import type { TrendChartDatum, TrendChartSeries } from "./trendChartShared";

// recharts cannot measure itself on the server, so it is replaced by recording stubs. This lets
// the tests assert exactly what the chart components hand to recharts (rows, partial handling,
// stacking, animation flags, color tokens) without a browser. Real rendering: Phase 9.
type RechartsProps = { children?: ReactNode } & Record<string, unknown>;
interface Call {
  name: string;
  props: RechartsProps;
}

const recorded = vi.hoisted(() => ({ calls: [] as Call[] }));

vi.mock("recharts", async () => {
  const { createElement } = await import("react");
  const stub = (name: string) => (props: RechartsProps) => {
    recorded.calls.push({ name, props });
    return createElement("div", { "data-stub": name }, props.children);
  };
  return Object.fromEntries(
    ["Bar", "BarChart", "CartesianGrid", "Cell", "Line", "LineChart", "ResponsiveContainer", "Tooltip", "XAxis", "YAxis"].map(
      (name) => [name, stub(name)],
    ),
  );
});

const callsOf = (name: string): Call[] => recorded.calls.filter((call) => call.name === name);
const propsOf = (name: string): RechartsProps => {
  const call = callsOf(name)[0];
  if (!call) throw new Error(`recharts stub ${name} was not rendered`);
  return call.props;
};

const SERIES: TrendChartSeries[] = [
  { key: "paid", label: "Paid", tone: "success" },
  { key: "failed", label: "Failed", tone: "danger" },
];
const BASE = { series: SERIES, ariaLabel: "Chart", emptyLabel: "Empty" } as const;

beforeEach(() => {
  recorded.calls.length = 0;
});

describe("TrendBarChart -> recharts", () => {
  const data: TrendChartDatum[] = [
    { label: "Aug", paid: 5, failed: 1 },
    { label: "Sep", paid: 7, failed: 2, partial: true },
  ];

  it("renders nothing from recharts in the empty state", () => {
    renderHtml(<TrendBarChart {...BASE} data={[{ label: "Aug", paid: 0 }]} />);
    expect(recorded.calls).toHaveLength(0);
  });

  it("fills the responsive container and passes the data rows through", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    expect(propsOf("ResponsiveContainer")).toMatchObject({ width: "100%", height: "100%" });
    expect(propsOf("BarChart").data).toEqual(data);
  });

  it("draws one Bar per series with its tone color, grouped by default (no stackId)", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    const bars = callsOf("Bar").map((call) => call.props);
    expect(bars.map((bar) => bar.dataKey)).toEqual(["paid", "failed"]);
    expect(bars.map((bar) => bar.name)).toEqual(["Paid", "Failed"]);
    expect(bars.map((bar) => bar.fill)).toEqual(["var(--mint-action)", "var(--blush-action)"]);
    expect(bars.every((bar) => bar.stackId === undefined)).toBe(true);
    expect(bars.every((bar) => Array.isArray(bar.radius))).toBe(true);
  });

  it("stacks every series on one stackId with square corners when stacked", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} stacked />);
    const bars = callsOf("Bar").map((call) => call.props);
    expect(new Set(bars.map((bar) => bar.stackId))).toEqual(new Set(["trend-stack"]));
    expect(bars.every((bar) => bar.radius === 0)).toBe(true);
  });

  it("renders partial points lighter with a dashed outline and complete points solid", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    const firstSeriesCells = callsOf("Cell").slice(0, 2).map((call) => call.props);
    expect(firstSeriesCells[0]).toMatchObject({ fillOpacity: 1, stroke: "none", strokeDasharray: undefined });
    expect(firstSeriesCells[1]).toMatchObject({
      fill: "var(--mint-action)",
      stroke: "var(--mint-action)",
      strokeDasharray: "4 3",
    });
    expect(Number(firstSeriesCells[1]?.fillOpacity)).toBeLessThan(1);
    expect(callsOf("Cell")).toHaveLength(4);
  });

  it("disables every animation and formats the y axis with valueFormatter", () => {
    const valueFormatter = (value: number): string => `${value} pts`;
    renderHtml(<TrendBarChart {...BASE} data={data} valueFormatter={valueFormatter} />);
    expect(callsOf("Bar").every((call) => call.props.isAnimationActive === false)).toBe(true);
    expect(propsOf("Tooltip").isAnimationActive).toBe(false);
    expect(propsOf("YAxis").tickFormatter).toBe(valueFormatter);
    expect(propsOf("YAxis").allowDecimals).toBe(false);
  });

  it("switches recharts' accessibility layer off so the svg is not a tab stop inside role=img", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    expect(propsOf("BarChart").accessibilityLayer).toBe(false);
    expect(propsOf("BarChart")).not.toHaveProperty("tabIndex");
    expect(propsOf("BarChart")).not.toHaveProperty("role");
  });

  it("keeps whole-number y ticks by default and allows decimals on request", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    expect(propsOf("YAxis").allowDecimals).toBe(false);
    recorded.calls.length = 0;
    renderHtml(<TrendBarChart {...BASE} data={data} allowDecimals />);
    expect(propsOf("YAxis").allowDecimals).toBe(true);
  });

  it("falls back to String for the y axis and brand for an untoned series", () => {
    renderHtml(<TrendBarChart {...BASE} series={[{ key: "paid", label: "Paid" }]} data={data} />);
    expect((propsOf("YAxis").tickFormatter as (value: number) => string)(12)).toBe("12");
    expect(propsOf("Bar").fill).toBe("var(--action)");
  });

  it("only hands theme variables (or none) to recharts as colors", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} />);
    const colors = [...callsOf("Bar"), ...callsOf("Cell"), ...callsOf("CartesianGrid"), ...callsOf("XAxis")]
      .flatMap((call) => [call.props.fill, call.props.stroke])
      .filter((value): value is string => typeof value === "string");
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.every((color) => color === "none" || color.startsWith("var(--"))).toBe(true);
  });

  it("builds a tooltip renderer that resolves the datum by label", () => {
    renderHtml(<TrendBarChart {...BASE} data={data} partialLabel="in progress" valueFormatter={(v) => `${v}u`} />);
    const content = propsOf("Tooltip").content as (props: unknown) => ReactElement | null;
    expect(textOf(renderHtml(content({ active: true, label: "Sep" }) as ReactElement))).toBe(
      "Sep in progress Paid 7u Failed 2u",
    );
    expect(content({ active: false, label: "Sep" })).toBeNull();
  });
});

describe("TrendLineChart -> recharts", () => {
  const row = (label: string, paid: number, partial?: boolean): TrendChartDatum =>
    partial ? { label, paid, partial } : { label, paid };
  const paidOnly: TrendChartSeries[] = [{ key: "paid", label: "Paid", tone: "info" }];
  const rowsOf = (): TrendChartDatum[] => propsOf("LineChart").data as TrendChartDatum[];

  it("renders nothing from recharts in the empty state", () => {
    renderHtml(<TrendLineChart {...BASE} data={[]} />);
    expect(recorded.calls).toHaveLength(0);
  });

  it("splits a trailing partial point into a solid run and a dashed continuation", () => {
    renderHtml(
      <TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 1), row("Sep", 2), row("Oct", 3, true)]} />,
    );
    expect(rowsOf()).toEqual([
      { label: "Aug", paid: 1, paid__partial: undefined },
      { label: "Sep", paid: 2, paid__partial: 2 },
      { label: "Oct", partial: true, paid: undefined, paid__partial: 3 },
    ]);
  });

  it("draws solid lines per series plus one dashed, legend-less line per series when partial exists", () => {
    renderHtml(
      <TrendLineChart {...BASE} series={SERIES} data={[row("Aug", 1), row("Sep", 2, true)]} />,
    );
    const lines = callsOf("Line").map((call) => call.props);
    expect(lines.map((line) => line.dataKey)).toEqual(["paid", "failed", "paid__partial", "failed__partial"]);
    const [solidPaid, , dashedPaid] = lines;
    expect(solidPaid?.strokeDasharray).toBeUndefined();
    expect(solidPaid?.stroke).toBe("var(--mint-action)");
    expect(dashedPaid).toMatchObject({
      strokeDasharray: "4 3",
      legendType: "none",
      activeDot: false,
      stroke: "var(--mint-action)",
    });
    // The dashed line draws a marker for partial points only (a function, not the default dot).
    expect(typeof dashedPaid?.dot).toBe("function");
    expect(solidPaid?.dot).toMatchObject({ r: 3 });
  });

  it("switches recharts' accessibility layer off so the svg is not a tab stop inside role=img", () => {
    renderHtml(<TrendLineChart {...BASE} data={[row("Aug", 1), row("Sep", 2, true)]} />);
    expect(propsOf("LineChart").accessibilityLayer).toBe(false);
    expect(propsOf("LineChart")).not.toHaveProperty("tabIndex");
    expect(propsOf("LineChart")).not.toHaveProperty("role");
  });

  it("keeps whole-number y ticks by default and allows decimals on request", () => {
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 1)]} />);
    expect(propsOf("YAxis").allowDecimals).toBe(false);
    recorded.calls.length = 0;
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 1)]} allowDecimals />);
    expect(propsOf("YAxis").allowDecimals).toBe(true);
  });

  it("renders a visible marker for a lone partial point (dashed key value plus a partial dot renderer)", () => {
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 4, true)]} />);
    expect(rowsOf().map((datum) => [datum.paid, datum.paid__partial])).toEqual([[undefined, 4]]);
    const dashed = callsOf("Line").map((call) => call.props)[1];
    const dot = dashed?.dot as (props: unknown) => ReactElement | null;
    expect(dashed?.dataKey).toBe("paid__partial");
    expect(renderHtml(dot({ cx: 5, cy: 6, payload: rowsOf()[0] }) as ReactElement)).toContain('stroke="var(--sky-action)"');
  });

  it("draws no dashed line when no point is partial", () => {
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 1), row("Sep", 2)]} />);
    expect(callsOf("Line").map((call) => call.props.dataKey)).toEqual(["paid"]);
    expect(rowsOf().every((datum) => datum.paid__partial === undefined)).toBe(true);
  });

  it("starts the dashed run at the partial point when there is no complete point before it", () => {
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 4, true), row("Sep", 5, true)]} />);
    expect(rowsOf().map((datum) => [datum.paid, datum.paid__partial])).toEqual([
      [undefined, 4],
      [undefined, 5],
    ]);
  });

  it("joins several consecutive partial points to the last complete point only", () => {
    renderHtml(
      <TrendLineChart
        {...BASE}
        series={paidOnly}
        data={[row("Jul", 1), row("Aug", 2), row("Sep", 3, true), row("Oct", 4, true)]}
      />,
    );
    expect(rowsOf().map((datum) => [datum.paid, datum.paid__partial])).toEqual([
      [1, undefined],
      [2, 2],
      [undefined, 3],
      [undefined, 4],
    ]);
  });

  it("never lets the solid and dashed value overlap on the same point except the join point", () => {
    renderHtml(
      <TrendLineChart {...BASE} series={paidOnly} data={[row("A", 1), row("B", 2), row("C", 3, true)]} />,
    );
    const overlapping = rowsOf().filter((datum) => datum.paid !== undefined && datum.paid__partial !== undefined);
    expect(overlapping.map((datum) => datum.label)).toEqual(["B"]);
  });

  it("normalises missing and non-finite values to 0 in both runs", () => {
    renderHtml(
      <TrendLineChart
        {...BASE}
        series={SERIES}
        data={[{ label: "Aug", paid: 3 }, { label: "Sep", paid: Number.NaN, failed: 2, partial: true }]}
      />,
    );
    expect(rowsOf()).toEqual([
      { label: "Aug", paid: 3, failed: 0, paid__partial: 3, failed__partial: 0 },
      { label: "Sep", partial: true, paid: undefined, failed: undefined, paid__partial: 0, failed__partial: 2 },
    ]);
  });

  it("does not mutate the data it was given", () => {
    const data = [row("Aug", 1), row("Sep", 2, true)];
    const snapshot = JSON.stringify(data);
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={data} />);
    expect(JSON.stringify(data)).toBe(snapshot);
  });

  it("disables every animation and keeps lines monotone with theme-variable strokes", () => {
    renderHtml(<TrendLineChart {...BASE} data={[row("Aug", 1), row("Sep", 2, true)]} />);
    const lines = callsOf("Line").map((call) => call.props);
    expect(lines.every((line) => line.isAnimationActive === false)).toBe(true);
    expect(lines.every((line) => line.type === "monotone")).toBe(true);
    expect(lines.every((line) => String(line.stroke).startsWith("var(--"))).toBe(true);
    expect(propsOf("Tooltip").isAnimationActive).toBe(false);
  });

  it("builds a tooltip renderer over the ORIGINAL data, not the split rows", () => {
    renderHtml(<TrendLineChart {...BASE} series={paidOnly} data={[row("Aug", 1), row("Sep", 2, true)]} />);
    const content = propsOf("Tooltip").content as (props: unknown) => ReactElement | null;
    expect(textOf(renderHtml(content({ active: true, label: "Sep" }) as ReactElement))).toBe("Sep Paid 2");
  });
});
