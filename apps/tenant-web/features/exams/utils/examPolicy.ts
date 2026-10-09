import type { ExamMode, LockdownMode } from "@pte/api-client";
import {
  CREATE_EXAM_WIZARD_TEXT,
  OFFICIAL_EXAM_LOCKDOWN_MODE,
  OFFICIAL_EXAM_MODE,
} from "../constants";

/** Uses the server policy value for display; null is a legacy/unknown response. */
export function getExamPolicyLabel(
  examMode: ExamMode | null,
  lockdownMode: LockdownMode | null | undefined,
): string {
  if (lockdownMode === null || lockdownMode === undefined) {
    return CREATE_EXAM_WIZARD_TEXT.POLICY_LEGACY;
  }
  if (examMode === OFFICIAL_EXAM_MODE && lockdownMode === OFFICIAL_EXAM_LOCKDOWN_MODE) {
    return CREATE_EXAM_WIZARD_TEXT.POLICY_OFFICIAL_STRICT;
  }
  return CREATE_EXAM_WIZARD_TEXT.POLICY_UNAVAILABLE;
}
