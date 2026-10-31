import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";

export interface PoolSlot {
  available: number;
  required: number;
  ready: boolean;
}

/** Approved-question coverage keyed by task type, so each table row can look up its own badge. */
export function buildPoolIndex(
  feasibility: ScoreTemplateFeasibilityResponse | undefined,
): ReadonlyMap<string, PoolSlot> {
  const index = new Map<string, PoolSlot>();
  for (const slot of feasibility?.slots ?? []) {
    if (slot.reason !== null && slot.reason !== "INSUFFICIENT_POOL") continue;
    index.set(slot.taskType, {
      available: slot.available,
      required: slot.required,
      ready: slot.ready,
    });
  }
  return index;
}
