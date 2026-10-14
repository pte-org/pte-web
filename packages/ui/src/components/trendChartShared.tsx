import type { ReactElement, ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import { cn } from "../utils/cn";
import { CHART_TONE_COLORS, CHART_TONE_DOT_CLASSES, type ChartTone } from "./chartTones";

/**
 * One x-axis point. `label` is the category (for example a month); every other key is a
 * series value addressed through `TrendChartSeries.key`. `partial` flags an in-progress period.
 *
 * `label` MUST be unique within `data`: it is the displayed x text, the React key of table rows
 * and bar cells, and the key the tooltip uses to find the datum. Duplicates give React key
 * warnings and a tooltip that always shows the first datum with that label, so make the label
 * unambiguous (for example "Jan 2026" instead of "Jan" when the data spans several years).
 */
export interface TrendChartDatum {
  label: string;
  partial?: boolean;
  [seriesKey: string]: string | number | boolean | undefined;
}

export interface TrendChartSeries {
  key: string;
  label: string;
  /**
   * Theme tone of the series. When omitted the series falls back to the `brand` tone, so
   * several series without a `tone` are indistinguishable: pass a distinct `tone` to every
   * series whenever a chart shows more than one.
   */
  tone?: ChartTone;
}

export interface TrendChartBaseProps {
  /** Points in x order. `label` must be unique per datum (see {@link TrendChartDatum}). */
  data: readonly TrendChartDatum[];
  series: readonly TrendChartSeries[];
  /** Accessible name of the chart; also the caption of the screen-reader data table. */
  ariaLabel: string;
  /**
   * Text shown instead of the chart when there is nothing to plot. It is plain readable content
   * (role="status"), so assistive technology reads it; the chart name is not repeated there.
   */
  emptyLabel: string;
  /** Formats values in axis ticks, tooltip and the screen-reader table. Defaults to `String`. */
  valueFormatter?: (value: number) => string;
  /**
   * Whether the y axis may place ticks on non-integer values. Defaults to `false`, which keeps
   * every tick a whole number (right for counts, but a 0..1 series such as a rate collapses to
   * the ticks 0 and 1, so pass `true` for fractional data).
   */
  allowDecimals?: boolean;
  /** Legend text for points flagged `partial`, for example "Month in progress". */
  partialLabel?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /**
   * Height classes for the plot area. Recharts needs an explicit height on its parent or it
   * renders at zero size, so this defaults to `h-64`; override with another `h-*` class.
   */
  chartClassName?: string;
}

export const DEFAULT_CHART_HEIGHT_CLASS = "h-64";
export const AXIS_TICK = { fill: "var(--ink-muted)", fontSize: 12 } as const;
export const GRID_STROKE = "var(--shell-border)";
export const PARTIAL_FILL_OPACITY = 0.45;
export const PARTIAL_DASH = "4 3";
export const DEFAULT_ALLOW_DECIMALS = false;

export const DEFAULT_VALUE_FORMATTER = (value: number): string => String(value);

export const toneColor = (series: TrendChartSeries): string =>
  CHART_TONE_COLORS[series.tone ?? "brand"];

export const readSeriesValue = (datum: TrendChartDatum, key: string): number => {
  const value = datum[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const hasTrendData = (
  data: readonly TrendChartDatum[],
  series: readonly TrendChartSeries[],
): boolean =>
  data.some((datum) => series.some((item) => readSeriesValue(datum, item.key) !== 0));

const SeriesDot = ({ tone, partial = false }: { tone?: ChartTone; partial?: boolean }): ReactElement => (
  <span
    aria-hidden="true"
    className={cn(
      "h-2.5 w-2.5 shrink-0 rounded-full",
      CHART_TONE_DOT_CLASSES[tone ?? "brand"],
      partial && "opacity-45",
    )}
  />
);

interface TrendChartTooltipProps {
  datum: TrendChartDatum;
  series: readonly TrendChartSeries[];
  formatValue: (value: number) => string;
  partialLabel?: string;
}

const TrendChartTooltip = ({
  datum,
  series,
  formatValue,
  partialLabel,
}: TrendChartTooltipProps): ReactElement => (
  <div className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-3 py-2 text-xs shadow-card">
    <p className="font-medium text-[var(--ink-primary)]">{datum.label}</p>
    {datum.partial && partialLabel && (
      <p className="mt-0.5 text-[var(--ink-muted)]">{partialLabel}</p>
    )}
    <ul className="mt-1.5 grid gap-1">
      {series.map((item) => (
        <li key={item.key} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
            <SeriesDot tone={item.tone} />
            {item.label}
          </span>
          <span className="tabular-nums text-[var(--ink-primary)]">
            {formatValue(readSeriesValue(datum, item.key))}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

/** Builds the recharts `content` renderer; looks the datum up by its x label. */
export const createTooltipRenderer = ({
  data,
  ...tooltipProps
}: Omit<TrendChartTooltipProps, "datum"> & { data: readonly TrendChartDatum[] }): ((
  props: TooltipContentProps,
) => ReactNode) => {
  const renderTooltip = (props: TooltipContentProps): ReactNode => {
    const datum = props.active ? data.find((candidate) => candidate.label === props.label) : undefined;
    return datum ? <TrendChartTooltip {...tooltipProps} datum={datum} /> : null;
  };
  return renderTooltip;
};

interface TrendChartFrameProps extends TrendChartBaseProps {
  /** The recharts chart element, rendered inside a sized `ResponsiveContainer`. */
  children: ReactNode;
}

/**
 * Shared chrome for trend charts: empty state, `role="img"` plot, legend and a screen-reader
 * data table. The table is a sibling of the image role so assistive technology can reach it.
 */
export const TrendChartFrame = ({
  data,
  series,
  ariaLabel,
  emptyLabel,
  valueFormatter = DEFAULT_VALUE_FORMATTER,
  partialLabel,
  className,
  chartClassName = DEFAULT_CHART_HEIGHT_CLASS,
  children,
}: TrendChartFrameProps): ReactElement => {
  if (!hasTrendData(data, series)) {
    // Not role="img": an image role makes its text presentational, which would hide emptyLabel
    // from screen readers. role="status" keeps the visible text exposed.
    return (
      <div
        className={cn(
          "flex min-h-40 items-center justify-center rounded-lg bg-[var(--surface-subtle)] px-5 text-center text-sm text-[var(--ink-muted)]",
          className,
        )}
        role="status"
      >
        {emptyLabel}
      </div>
    );
  }

  const showPartialLegend = Boolean(partialLabel) && data.some((datum) => datum.partial);

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div role="img" aria-label={ariaLabel} className={cn("w-full min-w-0", chartClassName)}>
        {children}
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-secondary)]">
        {series.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5">
            <SeriesDot tone={item.tone} />
            {item.label}
          </li>
        ))}
        {showPartialLegend && (
          <li className="flex items-center gap-1.5 text-[var(--ink-muted)]">
            <SeriesDot partial />
            {partialLabel}
          </li>
        )}
      </ul>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <td />
            {series.map((item) => (
              <th key={item.key} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">
                {datum.label}
                {datum.partial && partialLabel ? ` (${partialLabel})` : ""}
              </th>
              {series.map((item) => (
                <td key={item.key}>{valueFormatter(readSeriesValue(datum, item.key))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
