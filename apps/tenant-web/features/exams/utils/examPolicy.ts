import type { ExamMode, LockdownMode } from "@pte/api-client";
import { CREATE_EXAM_WIZARD_TEXT, EXAM_POLICY_LABELS } from "../constants";

/** Uses the server policy value for display; null is a legacy/unknown response. */
export function getExamPolicyLabel(
  examMode: ExamMode | null,
  lockdownMode: LockdownMode | null | undefined,
): string {
  if (lockdownMode === null || lockdownMode === undefined) {
    return CREATE_EXAM_WIZARD_TEXT.POLICY_LEGACY;
  }
  if (
    (examMode === "PRACTICE" && (lockdownMode === "NONE" || lockdownMode === "STANDARD")) ||
    (examMode === "OFFICIAL_EXAM" && lockdownMode === "STRICT")
  ) {
    return EXAM_POLICY_LABELS[lockdownMode];
  }
  return CREATE_EXAM_WIZARD_TEXT.POLICY_UNAVAILABLE;
}
