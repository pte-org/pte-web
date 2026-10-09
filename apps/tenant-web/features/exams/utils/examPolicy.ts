import type { ExamMode, LockdownMode } from "@pte/api-client";
import { CREATE_EXAM_WIZARD_TEXT, EXAM_POLICY_LABELS } from "../constants";

type Translate = (key: string, fallback?: string) => string;

/** Uses the server policy value for display; null is a legacy/unknown response. */
export function getExamPolicyLabel(
  examMode: ExamMode | null,
  lockdownMode: LockdownMode | null | undefined,
  translate?: Translate,
): string {
  const t = translate ?? ((_key: string, fallback?: string) => fallback ?? "");
  if (lockdownMode === null || lockdownMode === undefined) {
    return t("tenant.createExam.POLICY_LEGACY", CREATE_EXAM_WIZARD_TEXT.POLICY_LEGACY);
  }
  if (
    (examMode === "PRACTICE" && (lockdownMode === "NONE" || lockdownMode === "STANDARD")) ||
    (examMode === "OFFICIAL_EXAM" && lockdownMode === "STRICT")
  ) {
    const keyByMode: Record<LockdownMode, string> = {
      NONE: "tenant.createExam.POLICY_PRACTICE_UNRESTRICTED",
      STANDARD: "tenant.createExam.POLICY_PRACTICE_CONTROLLED",
      STRICT: "tenant.createExam.POLICY_OFFICIAL_STRICT",
    };
    return t(keyByMode[lockdownMode], EXAM_POLICY_LABELS[lockdownMode]);
  }
  return t("tenant.createExam.POLICY_UNAVAILABLE", CREATE_EXAM_WIZARD_TEXT.POLICY_UNAVAILABLE);
}
