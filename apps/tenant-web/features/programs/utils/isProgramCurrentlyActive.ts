import type { ProgramResponse } from "@pte/api-client";

/**
 * Mirrors admin's real `Program.isCurrentlyActive(LocalDate today)`
 * exactly: both dates null = always active; otherwise `today` must fall
 * within the inclusive `[startDate, endDate]` range. Compares plain ISO
 * date strings (`YYYY-MM-DD`, lexically ordered) rather than `Date`
 * objects, so there's no timezone-driven off-by-one against the backend's
 * `LocalDate` (which carries no time-of-day at all).
 */
export function isProgramCurrentlyActive(program: ProgramResponse, today: string = new Date().toISOString().slice(0, 10)): boolean {
  const afterStart = !program.startDate || today >= program.startDate;
  const beforeEnd = !program.endDate || today <= program.endDate;
  return afterStart && beforeEnd;
}
