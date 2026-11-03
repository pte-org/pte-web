"use client";

import type { ReactElement } from "react";
import { cn } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { StudioTile, StudioTileState } from "../types";

const DOT: Record<StudioTileState, string> = {
  ready: "bg-[var(--mint-action)]",
  short: "bg-[var(--cream-action)]",
  missing: "bg-[var(--blush-action)]",
  outside: "bg-[var(--ink-muted)]",
};

interface StudioLegendProps {
  tiles: readonly StudioTile[];
  /** The state the tiles are narrowed to, or null for all of them. */
  filter: StudioTileState | null;
  onFilter: (state: StudioTileState | null) => void;
}

/** What each tile colour means, with how many tiles have it; pressing one narrows the tiles to it. */
export const StudioLegend = ({ tiles, filter, onFilter }: StudioLegendProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const entries: readonly [StudioTileState, string][] = [
    ["ready", text.LEGEND_READY],
    ["short", text.LEGEND_SHORT],
    ["missing", text.LEGEND_MISSING],
    ["outside", text.LEGEND_OUTSIDE],
  ];

  return (
    <ul className="flex flex-wrap gap-1.5">
      {entries.map(([state, label]) => {
        const count = tiles.filter((tile) => tile.state === state).length;
        const active = filter === state;
        return (
          <li key={state}>
            <button
              type="button"
              aria-pressed={active}
              disabled={count === 0}
              onClick={() => onFilter(active ? null : state)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs text-[var(--ink-secondary)] transition",
                "hover:bg-[var(--surface-subtle)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
                active
                  ? "border-[var(--brand)] bg-[var(--surface-subtle)] text-[var(--ink-primary)]"
                  : "border-[var(--shell-border)]",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", DOT[state])} aria-hidden="true" />
              {label}
              <span className="font-semibold text-[var(--ink-primary)]">{count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
