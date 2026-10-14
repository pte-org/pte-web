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
  <SectionPanel
    title={title}
    section={section}
    onRetry={onRetry}
    className="h-full"
    contentClassName="flex-1 flex flex-col justify-between gap-3"
  >
    {(data) => (
      <div className="flex h-full flex-col justify-between gap-3">
        <dl className="flex flex-col gap-2">
          {rows(data).map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-subtle)]/60 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-subtle)]"
            >
              <dt className="text-[var(--ink-secondary)]">{row.label}</dt>
              <dd className="font-semibold tabular-nums text-[var(--ink-primary)]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto border-t border-[var(--shell-border)]/50 pt-2.5">
          <PanelLink href={href}>{linkLabel}</PanelLink>
        </div>
      </div>
    )}
  </SectionPanel>
);
