import type { ScoreTemplateItemRequest } from "@pte/api-client";

export type CountField = "minCount" | "maxCount";

/** A task type kept in a template must ask at least one question. */
export const MIN_QUESTION_COUNT = 1;

/** Turns what the host typed into a whole count; blanks and junk fall back to the lowest allowed count. */
export function parseCount(raw: string): number {
  const parsed = Math.floor(Number(raw));
  return Number.isFinite(parsed) && parsed >= MIN_QUESTION_COUNT ? parsed : MIN_QUESTION_COUNT;
}

export function setCount(
  items: readonly ScoreTemplateItemRequest[],
  taskTypeKey: string,
  field: CountField,
  value: number,
): ScoreTemplateItemRequest[] {
  return items.map((item) =>
    item.taskTypeKey === taskTypeKey ? { ...item, [field]: value } : item,
  );
}

/** Task types whose range the backend would refuse: below one question, or a minimum above the maximum. */
export function findInvalidCounts(items: readonly ScoreTemplateItemRequest[]): string[] {
  return items
    .filter(
      (item) =>
        item.minCount < MIN_QUESTION_COUNT ||
        item.maxCount < MIN_QUESTION_COUNT ||
        item.minCount > item.maxCount,
    )
    .map((item) => item.taskTypeKey);
}
