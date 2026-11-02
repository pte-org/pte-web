import type { ScoreTemplateItemResponse } from "@pte/api-client";
import { SECONDS_PER_MINUTE, STUDIO_SECTIONS, STUDIO_TIMELINE_COLUMNS } from "./constants";

export interface TimelineBlock {
  key: string;
  item: ScoreTemplateItemResponse;
  seconds: number;
  /** How many of the lane's grid columns the block fills, so its width follows its duration. */
  span: number;
}

export interface TimelineLane {
  section: string;
  blocks: TimelineBlock[];
  seconds: number;
}

/** Time one exam spends on a task type: every question it draws, preparation plus response. */
export const blockSeconds = (item: ScoreTemplateItemResponse): number =>
  item.maxCount * (item.prepSeconds + item.responseSeconds);

/**
 * Splits `columns` between the blocks in proportion to their time, never giving one less than a column
 * (so it stays clickable), by the largest-remainder method so the spans add up exactly.
 */
export function distributeSpans(seconds: readonly number[], columns: number): number[] {
  if (seconds.length === 0) return [];
  const budget = Math.max(columns, seconds.length);
  const spare = budget - seconds.length;
  const total = seconds.reduce((sum, value) => sum + value, 0);
  const shares = seconds.map((value) => (total > 0 ? (value / total) * spare : spare / seconds.length));
  const spans = shares.map((share) => 1 + Math.floor(share));
  let leftover = budget - spans.reduce((sum, span) => sum + span, 0);
  const byRemainder = shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byRemainder) {
    if (leftover <= 0) break;
    spans[index] += 1;
    leftover -= 1;
  }
  return spans;
}

/** One lane per skill; a lane is as wide as its share of the longest lane. */
export function buildTimeline(items: readonly ScoreTemplateItemResponse[]): TimelineLane[] {
  const sorted = [...items].sort((a, b) => a.sequence - b.sequence);
  const lanes = STUDIO_SECTIONS.map((section) => {
    const inSection = sorted.filter((item) => item.section === section);
    const seconds = inSection.map(blockSeconds);
    return { section, inSection, seconds, total: seconds.reduce((sum, value) => sum + value, 0) };
  });
  const longest = Math.max(...lanes.map((lane) => lane.total), 1);

  return lanes.map(({ section, inSection, seconds, total }) => {
    const columns = Math.min(
      STUDIO_TIMELINE_COLUMNS,
      Math.max(inSection.length, Math.round((total / longest) * STUDIO_TIMELINE_COLUMNS)),
    );
    const spans = distributeSpans(seconds, columns);
    return {
      section,
      seconds: total,
      blocks: inSection.map((item, index) => ({
        key: item.taskTypeKey,
        item,
        seconds: seconds[index],
        span: spans[index],
      })),
    };
  });
}

/** The lane's task type keys with `moved` placed where `target` is, for the drop that reorders a lane. */
export function reorderKeys(keys: readonly string[], moved: string, target: string): string[] {
  if (moved === target || !keys.includes(moved) || !keys.includes(target)) return [...keys];
  const without = keys.filter((key) => key !== moved);
  without.splice(without.indexOf(target), 0, moved);
  return without;
}

/** 525 seconds as "8:45". */
export const formatDuration = (seconds: number): string =>
  `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;
