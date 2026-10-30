import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { renderHtml } from "../testing/renderHtml";
import { buildRows, createPartialDotRenderer } from "../../../src/components/TrendLineChart";
import type { TrendChartDatum, TrendChartSeries } from "../../../src/components/trendChartShared";

// Pure logic behind the line chart's partial handling, tested directly (no recharts needed).
describe("buildRows (partial handling)", () => {
  const point = (label: string, paid: number, partial?: boolean): TrendChartDatum =>
    partial ? { label, paid, partial } : { label, paid };
  const paidOnly: TrendChartSeries[] = [{ key: "paid", label: "Paid" }];
  // [solid, dashed] per row
  const pairs = (data: TrendChartDatum[]): Array<[unknown, unknown]> =>
    buildRows(data, paidOnly).map((datum) => [datum.paid, datum.paid__partial]);

  it("keeps a single partial point on the dashed key only so it can be marked (nothing else to join)", () => {
    expect(pairs([point("Aug", 4, true)])).toEqual([[undefined, 4]]);
  });

  it("joins a partial point in the middle to the complete points on BOTH sides", () => {
    expect(pairs([point("A", 1), point("B", 2, true), point("C", 3)])).toEqual([
      [1, 1],
      [undefined, 2],
      [3, 3],
    ]);
  });

  it("does not dash points that only neighbour a complete point", () => {
    expect(pairs([point("A", 1), point("B", 2), point("C", 3, true), point("D", 4), point("E", 5)])).toEqual([
      [1, undefined],
      [2, 2],
      [undefined, 3],
      [4, 4],
      [5, undefined],
    ]);
  });

  it("joins a trailing partial point to the last complete point only", () => {
    expect(pairs([point("A", 1), point("B", 2), point("C", 3, true)])).toEqual([
      [1, undefined],
      [2, 2],
      [undefined, 3],
    ]);
  });

  it("leaves the dashed key empty on every row when nothing is partial", () => {
    expect(pairs([point("A", 1), point("B", 2), point("C", 3)])).toEqual([
      [1, undefined],
      [2, undefined],
      [3, undefined],
    ]);
  });

  it("treats partial: false like a complete point", () => {
    const rows = buildRows([{ label: "A", paid: 1, partial: false }, point("B", 2)], paidOnly);
    expect(rows.map((datum) => datum.paid__partial)).toEqual([undefined, undefined]);
  });
});

describe("createPartialDotRenderer", () => {
  const render = createPartialDotRenderer("var(--mint-action)");

  it("draws a hollow tone-colored marker for a partial row", () => {
    const html = renderHtml(render({ cx: 10, cy: 20, payload: { label: "Oct", partial: true } }) as ReactElement);
    expect(html).toBe(
      '<circle cx="10" cy="20" r="3" fill="var(--surface-card)" stroke="var(--mint-action)" stroke-width="2"></circle>',
    );
  });

  it("draws nothing for complete rows, missing payloads or points without coordinates", () => {
    expect(render({ cx: 10, cy: 20, payload: { label: "Sep" } })).toBeNull();
    expect(render({ cx: 10, cy: 20, payload: { label: "Sep", partial: false } })).toBeNull();
    expect(render({ cx: 10, cy: 20 })).toBeNull();
    expect(render({ cx: 10, payload: { partial: true } })).toBeNull();
    expect(render({ cy: 20, payload: { partial: true } })).toBeNull();
  });
});
