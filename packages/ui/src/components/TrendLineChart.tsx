"use client";

import type { ReactElement, ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AXIS_TICK,
  createTooltipRenderer,
  DEFAULT_ALLOW_DECIMALS,
  DEFAULT_VALUE_FORMATTER,
  GRID_STROKE,
  PARTIAL_DASH,
  readSeriesValue,
  toneColor,
  TrendChartFrame,
  type TrendChartBaseProps,
  type TrendChartDatum,
  type TrendChartSeries,
} from "./trendChartShared";

export type TrendLineChartProps = TrendChartBaseProps;

const LINE_STROKE_WIDTH = 2;
const DOT_RADIUS = 3;
const PARTIAL_SUFFIX = "__partial";

const partialKey = (seriesKey: string): string => `${seriesKey}${PARTIAL_SUFFIX}`;

/**
 * Splits every series in two so partial periods can be drawn as dashed segments: the solid key
 * skips partial points, the partial key covers each partial point plus the complete point right
 * before and right after it, so every segment that touches a partial point is dashed (a partial
 * point in the middle reconnects to the following complete point). `undefined` leaves a gap,
 * so the two lines only share those joining complete points.
 */
export const buildRows = (
  data: readonly TrendChartDatum[],
  series: readonly TrendChartSeries[],
): TrendChartDatum[] =>
  data.map((datum, index) => {
    const row: TrendChartDatum = { ...datum };
    const touchesPartial =
      datum.partial === true || data[index + 1]?.partial === true || data[index - 1]?.partial === true;
    for (const item of series) {
      const value = readSeriesValue(datum, item.key);
      row[item.key] = datum.partial ? undefined : value;
      row[partialKey(item.key)] = touchesPartial ? value : undefined;
    }
    return row;
  });

interface PartialDotProps {
  cx?: number | string;
  cy?: number | string;
  payload?: unknown;
}

const isPartialRow = (payload: unknown): boolean =>
  typeof payload === "object" && payload !== null && "partial" in payload && payload.partial === true;

/**
 * Dot renderer for the dashed line: draws the same hollow marker as the solid line, but only on
 * rows flagged `partial`. The joining complete points already carry the solid line's marker, and
 * a lone partial point (nothing else to connect to) would otherwise be invisible.
 */
export const createPartialDotRenderer = (color: string): ((props: PartialDotProps) => ReactNode) => {
  const renderPartialDot = ({ cx, cy, payload }: PartialDotProps): ReactNode =>
    isPartialRow(payload) && typeof cx === "number" && typeof cy === "number" ? (
      <circle
        cx={cx}
        cy={cy}
        r={DOT_RADIUS}
        fill="var(--surface-card)"
        stroke={color}
        strokeWidth={LINE_STROKE_WIDTH}
      />
    ) : null;
  return renderPartialDot;
};

/**
 * Multi-series line chart over theme tones. The parent must have a bounded width; the plot
 * height comes from `chartClassName` (default `h-64`). Points flagged `partial` are drawn dashed:
 * the segments touching a partial point are dashed and the point itself gets a marker, including
 * a lone partial point and one in the middle of the data (`partial` is normally a trailing
 * in-progress period). The legend explains it through `partialLabel`.
 *
 * Accessibility: the plot is wrapped in `role="img"` and the sr-only data table is the text
 * alternative, so recharts' own accessibility layer is switched off (`accessibilityLayer={false}`);
 * left on, it would make the svg a focusable `role="application"` tab stop nested inside the image
 * role. The tooltip is therefore pointer-only. Series without a `tone` all use the brand tone, so
 * give each series its own `tone`, and keep `label` unique per datum (see `TrendChartDatum`).
 */
export const TrendLineChart = (props: TrendLineChartProps): ReactElement => {
  const {
    data,
    series,
    valueFormatter = DEFAULT_VALUE_FORMATTER,
    allowDecimals = DEFAULT_ALLOW_DECIMALS,
    partialLabel,
  } = props;
  const hasPartial = data.some((datum) => datum.partial);

  return (
    <TrendChartFrame {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={buildRows(data, series)}
          accessibilityLayer={false}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <YAxis
            width="auto"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={valueFormatter}
            allowDecimals={allowDecimals}
          />
          <Tooltip
            isAnimationActive={false}
            content={createTooltipRenderer({ data, series, formatValue: valueFormatter, partialLabel })}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={toneColor(item)}
              strokeWidth={LINE_STROKE_WIDTH}
              dot={{ r: DOT_RADIUS, fill: "var(--surface-card)" }}
              isAnimationActive={false}
            />
          ))}
          {hasPartial &&
            series.map((item) => (
              <Line
                key={partialKey(item.key)}
                type="monotone"
                dataKey={partialKey(item.key)}
                legendType="none"
                stroke={toneColor(item)}
                strokeWidth={LINE_STROKE_WIDTH}
                strokeDasharray={PARTIAL_DASH}
                dot={createPartialDotRenderer(toneColor(item))}
                activeDot={false}
                isAnimationActive={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </TrendChartFrame>
  );
};
