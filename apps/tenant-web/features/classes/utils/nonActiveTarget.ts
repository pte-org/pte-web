import type { ClassStatusResponse } from "@pte/api-client";

/**
 * A Class only accepts new assignments while it is ACTIVE, so a transfer or merge into
 * a SUSPENDED/INACTIVE target is a silent-failure risk — the write is accepted but the
 * student effectively disappears from the flow. Both call sites gate the submit behind a
 * typed-confirm once the target is non-ACTIVE.
 */
export function isNonActiveClass(status: ClassStatusResponse): boolean {
  return status !== "ACTIVE";
}
