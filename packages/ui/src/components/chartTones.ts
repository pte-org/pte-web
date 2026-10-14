/**
 * Shared tone palette for every chart primitive (donut, bar, line).
 * Colors come from the theme CSS variables so light and dark modes follow the
 * design tokens; never put raw color values in chart code.
 */
export type ChartTone = "brand" | "info" | "success" | "warning" | "danger" | "neutral";

/** Value usable in SVG `fill` / `stroke` attributes. */
export const CHART_TONE_COLORS: Record<ChartTone, string> = {
  brand: "var(--action)",
  info: "var(--sky-action)",
  success: "var(--mint-action)",
  warning: "var(--cream-action)",
  danger: "var(--blush-action)",
  neutral: "var(--ink-muted)",
};

/** Background utility for legend dots. Full class names so Tailwind can detect them. */
export const CHART_TONE_DOT_CLASSES: Record<ChartTone, string> = {
  brand: "bg-[var(--action)]",
  info: "bg-[var(--sky-action)]",
  success: "bg-[var(--mint-action)]",
  warning: "bg-[var(--cream-action)]",
  danger: "bg-[var(--blush-action)]",
  neutral: "bg-[var(--ink-muted)]",
};
