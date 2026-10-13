"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AXIS_TICK,
  createTooltipRenderer,
  DEFAULT_ALLOW_DECIMALS,
  DEFAULT_VALUE_FORMATTER,
  GRID_STROKE,
  PARTIAL_DASH,
  PARTIAL_FILL_OPACITY,
  toneColor,
  TrendChartFrame,
  type TrendChartBaseProps,
} from "./trendChartShared";

export interface TrendBarChartProps extends TrendChartBaseProps {
  /** Stack the series on top of each other instead of grouping them side by side. */
  stacked?: boolean;
}

const STACK_ID = "trend-stack";
const BAR_RADIUS = 3;

/**
 * Multi-series bar chart over theme tones. The parent must have a bounded width; the plot height
 * comes from `chartClassName` (default `h-64`). Points flagged `partial` render lighter with a
 * dashed outline, and the legend explains them through `partialLabel`.
 *
 * Accessibility: the plot is wrapped in `role="img"` and the sr-only data table is the text
 * alternative, so recharts' own accessibility layer is switched off (`accessibilityLayer={false}`).
 * Left on, it would make the svg a focusable `role="application"` tab stop nested inside the
 * image role. The tooltip is therefore pointer-only; keyboard users read the data table.
 * Series without a `tone` all use the brand tone, so give each series its own `tone`, and keep
 * `label` unique per datum (see `TrendChartDatum`).
 */
export const TrendBarChart = (props: TrendBarChartProps): ReactElement => {
  const {
    data,
    series,
    stacked = false,
    valueFormatter = DEFAULT_VALUE_FORMATTER,
    allowDecimals = DEFAULT_ALLOW_DECIMALS,
    partialLabel,
  } = props;
  const rows = [...data];

  return (
    <TrendChartFrame {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
            cursor={false}
            content={createTooltipRenderer({ data, series, formatValue: valueFormatter, partialLabel })}
          />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              stackId={stacked ? STACK_ID : undefined}
              fill={toneColor(item)}
              radius={stacked ? 0 : [BAR_RADIUS, BAR_RADIUS, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((datum) => (
                <Cell
                  key={datum.label}
                  fill={toneColor(item)}
                  fillOpacity={datum.partial ? PARTIAL_FILL_OPACITY : 1}
                  stroke={datum.partial ? toneColor(item) : "none"}
                  strokeDasharray={datum.partial ? PARTIAL_DASH : undefined}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </TrendChartFrame>
  );
};
