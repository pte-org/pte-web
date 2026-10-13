"use client";

import type { ReactElement } from "react";
import type { DashboardSection } from "@pte/api-client";
import { PanelLink } from "./PanelLink";
import { SectionPanel } from "./SectionPanel";

export interface MetricRow {
  label: string;
  value: string;
}

interface CompactMetricPanelProps<T> {
  title: string;
  section: DashboardSection<T> | undefined;
  onRetry: () => void;
  rows: (data: T) => MetricRow[];
  href: string;
  linkLabel: string;
}

/** Small label/value card for a section that has no chart: a few counts and a link to the full screen. */
export const CompactMetricPanel = <T,>({
  title,
  section,
  onRetry,
  rows,
  href,
  linkLabel,
}: CompactMetricPanelProps<T>): ReactElement | null => (
  <SectionPanel title={title} section={section} onRetry={onRetry} className="h-full">
    {(data) => (
      <div className="flex flex-col gap-3">
        <dl className="flex flex-col gap-2">
          {rows(data).map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-[var(--ink-secondary)]">{row.label}</dt>
              <dd className="font-semibold tabular-nums text-[var(--ink-primary)]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <PanelLink href={href}>{linkLabel}</PanelLink>
      </div>
    )}
  </SectionPanel>
);
