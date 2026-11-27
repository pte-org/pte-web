import type { ProctorSelection } from "../types";

/** Adds a proctor to the picked list, or removes them when they were already picked. */
export function toggleProctor(
  selection: readonly ProctorSelection[],
  proctorPublicId: string,
): ProctorSelection[] {
  return selection.some((entry) => entry.proctorPublicId === proctorPublicId)
    ? selection.filter((entry) => entry.proctorPublicId !== proctorPublicId)
    : [...selection, { proctorPublicId }];
}
