"use client";

import type { ReactElement } from "react";
import { Badge, ProgressBar, cn, type BadgeVariant, type ProgressTone } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { StudioTile, StudioTileState } from "../types";

const STATE_BADGE: Record<StudioTileState, BadgeVariant> = {
  ready: "success",
  short: "warning",
  missing: "danger",
  outside: "neutral",
};

const STATE_TONE: Record<StudioTileState, ProgressTone> = {
  ready: "success",
  short: "warning",
  missing: "danger",
  outside: "success",
};

interface StudioTileButtonProps {
  tile: StudioTile;
  selected: boolean;
  /** Whether to estimate how many exams the questions fill without repeating one. */
  showDistinctExams: boolean;
  onSelect: (key: string) => void;
}

export const StudioTileButton = ({
  tile,
  selected,
  showDistinctExams,
  onSelect,
}: StudioTileButtonProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const outside = tile.state === "outside";

  return (
    <button
      type="button"
      aria-pressed={selected}
      title={tile.key}
      onClick={() => onSelect(tile.key)}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
        outside
          ? "border-dashed border-[var(--shell-border)] bg-[var(--surface-subtle)]"
          : "border-[var(--shell-border)] bg-[var(--surface-card)]",
        selected && "border-[var(--brand)] ring-2 ring-[var(--brand)]/30",
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--ink-primary)]">
          {tile.type.displayName}
        </span>
        <Badge variant={STATE_BADGE[tile.state]}>
          {outside ? text.OUTSIDE_BADGE : `${tile.available}/${tile.required}`}
        </Badge>
      </span>
      {!outside && (
        <ProgressBar
          value={Math.min(tile.available, tile.required)}
          max={tile.required}
          tone={STATE_TONE[tile.state]}
          label={`${tile.type.displayName} ${tile.available}/${tile.required}`}
        />
      )}
      {!outside && showDistinctExams && tile.distinctExams !== null && (
        <span
          className="text-xs text-[var(--ink-muted)]"
          title={
            tile.distinctExams > 0
              ? text.DISTINCT_EXAMS.replace("{count}", String(tile.distinctExams))
              : text.DISTINCT_EXAMS_NONE
          }
        >
          {text.DISTINCT_EXAMS_SHORT.replace("{count}", String(tile.distinctExams))}
        </span>
      )}
    </button>
  );
};
