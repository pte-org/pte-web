import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";

export interface PoolSlot {
  available: number;
  required: number;
  ready: boolean;
}

/** Question-bank coverage keyed by task type, so each table row can look up its own badge. */
export function buildPoolIndex(
  feasibility: ScoreTemplateFeasibilityResponse | undefined,
): ReadonlyMap<string, PoolSlot> {
  const index = new Map<string, PoolSlot>();
  for (const slot of feasibility?.slots ?? []) {
    index.set(slot.taskType, {
      available: slot.available,
      required: slot.required,
      ready: slot.ready,
    });
  }
  return index;
}

/** How many of the given task types lack questions; keys the server did not report are not counted. */
export function countShortTypes(
  pool: ReadonlyMap<string, PoolSlot>,
  taskTypeKeys: readonly string[],
): number {
  return taskTypeKeys.filter((key) => pool.get(key)?.ready === false).length;
}
