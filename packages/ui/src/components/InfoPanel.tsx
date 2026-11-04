"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { ChevronRightIcon } from "./icons";

export interface InfoPanelRow {
  label: string;
  value: ReactNode;
}

interface InfoPanelProps {
  title: string;
  /** Whether the panel starts open; a screen that is busy with other things keeps it closed. */
  defaultOpen?: boolean;
  /** Keeps the panel open whatever the user did, such as to show an error inside it. */
  forceOpen?: boolean;
  /** What leads the panel, above the rows: a name, chips. */
  children?: ReactNode;
  /** Label and value pairs, one per line: the label muted on the left, the value on the right. */
  rows?: readonly InfoPanelRow[];
  className?: string;
}

/**
 * A small card of facts about the thing on screen, for the column beside a table. It folds down to its title,
 * so it costs one line where space is wanted for something else. The screen supplies the content.
 */
export const InfoPanel = ({
  title,
  defaultOpen = true,
  forceOpen = false,
  children,
  rows = [],
  className,
}: InfoPanelProps): ReactElement => (
  <details
    open={defaultOpen || forceOpen}
    className={cn(
      "group rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-3",
      className,
    )}
  >
    <summary className="-my-1 flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)] marker:hidden">
      {title}
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--ink-secondary)] transition hover:bg-[var(--surface-subtle)]">
        <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
      </span>
    </summary>
    <div className="mt-3 space-y-3">
      {children}
      {rows.length > 0 && (
        <dl className="divide-y divide-[var(--shell-border)] border-t border-[var(--shell-border)]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-2 text-xs">
              <dt className="shrink-0 text-[var(--ink-muted)]">{row.label}</dt>
              <dd className="min-w-0 text-right font-medium text-[var(--ink-primary)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  </details>
);
