import { describe, expect, expectTypeOf, it } from "vitest";
import { CHART_TONE_COLORS, CHART_TONE_DOT_CLASSES, type ChartTone } from "../../../src/components/chartTones";
import type { StatusDonutTone } from "../../../src/components/StatusDonutChart";

const ALL_TONES = ["brand", "info", "success", "warning", "danger", "neutral"] as const satisfies readonly ChartTone[];

describe("chartTones", () => {
  it("covers exactly the six tones in both maps (compile-time exhaustive via satisfies)", () => {
    expect(Object.keys(CHART_TONE_COLORS).sort()).toEqual([...ALL_TONES].sort());
    expect(Object.keys(CHART_TONE_DOT_CLASSES).sort()).toEqual([...ALL_TONES].sort());
  });

  it("ChartTone has no member beyond the six (type-level)", () => {
    expectTypeOf<ChartTone>().toEqualTypeOf<(typeof ALL_TONES)[number]>();
  });

  it.each(ALL_TONES)("tone '%s' maps to a theme CSS variable for SVG paint", (tone) => {
    expect(CHART_TONE_COLORS[tone]).toMatch(/^var\(--[a-z-]+\)$/);
  });

  it.each(ALL_TONES)("tone '%s' has a full Tailwind background class for the legend dot", (tone) => {
    expect(CHART_TONE_DOT_CLASSES[tone]).toMatch(/^bg-\[var\(--[a-z-]+\)\]$/);
  });

  it.each(ALL_TONES)("tone '%s' uses the same variable in the color and the dot class", (tone) => {
    expect(CHART_TONE_DOT_CLASSES[tone]).toBe(`bg-[${CHART_TONE_COLORS[tone]}]`);
  });

  it("keeps the exact palette the donut used before the extraction", () => {
    expect(CHART_TONE_COLORS).toEqual({
      brand: "var(--action)",
      info: "var(--sky-action)",
      success: "var(--mint-action)",
      warning: "var(--cream-action)",
      danger: "var(--blush-action)",
      neutral: "var(--ink-muted)",
    });
  });

  it("uses distinct colors per tone", () => {
    expect(new Set(Object.values(CHART_TONE_COLORS)).size).toBe(ALL_TONES.length);
  });

  it("StatusDonutTone is kept as an alias of ChartTone (type-level)", () => {
    expectTypeOf<StatusDonutTone>().toEqualTypeOf<ChartTone>();
  });
});
