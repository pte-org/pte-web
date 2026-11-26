/** What the writer's chart is made of, shown next to the real image while it is revealed. */
export interface ChartFacts {
  chartType: string | null;
  categories: number;
  series: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Read from the writer's draft; zeros and null until it wrote them (or for a picture, which has none). */
export function chartFacts(typed: unknown): ChartFacts {
  if (!isRecord(typed)) return { chartType: null, categories: 0, series: 0 };
  return {
    chartType: typeof typed.chartType === "string" ? typed.chartType : null,
    categories: Array.isArray(typed.categories) ? typed.categories.length : 0,
    series: Array.isArray(typed.series) ? typed.series.length : 0,
  };
}
