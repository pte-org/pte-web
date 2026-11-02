"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_SECTION_LABELS } from "@/features/scoretemplate/constants";
import { EXAM_STUDIO_TEXT } from "../constants";
import { formatDuration, reorderKeys, type TimelineLane } from "../timeline";

// Tailwind only emits classes it can read in full, so the spans are listed instead of built from a number.
const COL_SPAN_CLASS = [
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-4",
  "col-span-5",
  "col-span-6",
  "col-span-7",
  "col-span-8",
  "col-span-9",
  "col-span-10",
  "col-span-11",
  "col-span-12",
] as const;

const SECTION_BLOCK_CLASS: Record<string, string> = {
  SPEAKING: "bg-violet-600",
  WRITING: "bg-cyan-600",
  READING: "bg-green-600",
  LISTENING: "bg-orange-600",
};

interface TimelineLaneViewProps {
  lane: TimelineLane;
  names: ReadonlyMap<string, string>;
  selectedKey: string | null;
  reorderable: boolean;
  onSelect: (key: string) => void;
  onReorder: (orderedKeys: string[]) => void;
}

export const TimelineLaneView = ({
  lane,
  names,
  selectedKey,
  reorderable,
  onSelect,
  onReorder,
}: TimelineLaneViewProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const labels = useAdminCopy(SCORE_TEMPLATE_SECTION_LABELS);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const keys = lane.blocks.map((block) => block.key);

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center">
      <div>
        <p className="text-sm font-semibold text-[var(--ink-primary)]">
          {labels[lane.section as keyof typeof labels] ?? lane.section}
        </p>
        <p className="text-xs text-[var(--ink-muted)]">{formatDuration(lane.seconds)}</p>
      </div>
      {lane.blocks.length === 0 ? (
        <p className="rounded-lg bg-[var(--surface-subtle)] px-3 py-4 text-xs text-[var(--ink-muted)]">
          {text.TIMELINE_LANE_EMPTY}
        </p>
      ) : (
        <ul className="grid grid-cols-12 gap-1 rounded-lg bg-[var(--surface-subtle)] p-1">
          {lane.blocks.map((block) => (
            <li key={block.key} className={COL_SPAN_CLASS[block.span - 1]}>
              <button
                type="button"
                draggable={reorderable}
                aria-pressed={block.key === selectedKey}
                title={names.get(block.key) ?? block.key}
                onClick={() => onSelect(block.key)}
                onDragStart={() => setDraggingKey(block.key)}
                onDragEnd={() => setDraggingKey(null)}
                onDragOver={(event) => reorderable && event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingKey) onReorder(reorderKeys(keys, draggingKey, block.key));
                  setDraggingKey(null);
                }}
                className={cn(
                  "flex h-14 w-full flex-col justify-center overflow-hidden rounded-lg px-2 text-left text-xs text-white",
                  SECTION_BLOCK_CLASS[lane.section] ?? "bg-gray-600",
                  reorderable && "cursor-grab active:cursor-grabbing",
                  block.key === selectedKey && "ring-2 ring-[var(--ink-primary)]",
                  draggingKey === block.key && "opacity-40",
                )}
              >
                <span className="truncate font-semibold">{names.get(block.key) ?? block.key}</span>
                <span className="truncate opacity-90">
                  {text.TIMELINE_BLOCK.replace("{count}", String(block.item.maxCount)).replace(
                    "{time}",
                    formatDuration(block.seconds),
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
