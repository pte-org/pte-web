import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";

export interface PoolSlot {
  available: number;
  required: number;
  ready: boolean;
}

/** How many of the given task types lack questions; keys the server did not report are not counted. */
export function countShortTypes(
  pool: ReadonlyMap<string, PoolSlot>,
  taskTypeKeys: readonly string[],
): number {
  return taskTypeKeys.filter((key) => pool.get(key)?.ready === false).length;
}

/**
 * Bank counts seen in any coverage answer so far, by task type. The server only reports the types of the
 * saved template, so a type removed and added back (unsaved) keeps its count from an earlier answer.
 */
export function rememberAvailable(
  previous: ReadonlyMap<string, number>,
  feasibility: ScoreTemplateFeasibilityResponse | undefined,
): ReadonlyMap<string, number> {
  if (!feasibility) return previous;
  const next = new Map(previous);
  for (const slot of feasibility.slots) next.set(slot.taskType, slot.available);
  return next;
}

/** Coverage of the rows as edited now: "needed" is each row's maximum count, before anything is saved. */
export function buildLivePool(
  available: ReadonlyMap<string, number>,
  items: readonly { taskTypeKey: string; maxCount: number }[],
): ReadonlyMap<string, PoolSlot> {
  const index = new Map<string, PoolSlot>();
  for (const item of items) {
    const count = available.get(item.taskTypeKey);
    if (count === undefined) continue;
    index.set(item.taskTypeKey, { available: count, required: item.maxCount, ready: count >= item.maxCount });
  }
  return index;
}
