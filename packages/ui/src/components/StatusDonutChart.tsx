"use client";

import type { ReactElement } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "../utils/cn";
import { CHART_TONE_COLORS, CHART_TONE_DOT_CLASSES, type ChartTone } from "./chartTones";

export type StatusDonutTone = ChartTone;

export interface StatusDonutItem {
  key: string;
  label: string;
  value: number;
  tone?: StatusDonutTone;
}

export interface StatusDonutChartProps {
  items: readonly StatusDonutItem[];
  totalLabel: string;
  emptyLabel: string;
  ariaLabel: string;
  className?: string;
}

const normalizeValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(value, 0) : 0;

export const StatusDonutChart = ({
  items,
  totalLabel,
  emptyLabel,
  ariaLabel,
  className,
}: StatusDonutChartProps): ReactElement => {
  const chartItems = items
    .map((item) => ({ ...item, value: normalizeValue(item.value) }))
    .sort((first, second) => second.value - first.value);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex min-h-40 items-center justify-center rounded-lg bg-[var(--surface-subtle)] px-5 text-center text-sm text-[var(--ink-muted)]",
          className,
        )}
        role="img"
        aria-label={ariaLabel}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center",
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="relative h-36 w-36 shrink-0 mx-auto sm:mx-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartItems}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="88%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={1}
              stroke="var(--surface-card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {chartItems.map((item) => (
                <Cell key={item.key} fill={CHART_TONE_COLORS[item.tone ?? "neutral"]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold tabular-nums text-[var(--ink-primary)]">
            {total}
          </span>
          <span className="mt-0.5 max-w-20 text-[10px] text-[var(--ink-muted)]">{totalLabel}</span>
        </div>
      </div>
      <ul className="grid gap-3" aria-label={ariaLabel}>
        {chartItems.map((item) => {
          const percentage = Math.round((item.value / total) * 100);
          const tone = item.tone ?? "neutral";
          return (
            <li key={item.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-[var(--ink-secondary)]">
                <span
                  className={cn("h-2.5 w-2.5 shrink-0 rounded-full", CHART_TONE_DOT_CLASSES[tone])}
                  aria-hidden="true"
                />
                <span className="truncate" title={item.label}>{item.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[var(--ink-primary)] font-medium pl-1">
                {item.value} <span className="text-xs font-normal text-[var(--ink-muted)]">({percentage}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
