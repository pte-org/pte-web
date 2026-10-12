import type { ExamMode, LockdownMode } from "@pte/api-client";
import {
  CREATE_EXAM_WIZARD_TEXT,
  OFFICIAL_EXAM_LOCKDOWN_MODE,
  OFFICIAL_EXAM_MODE,
} from "../constants";

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
  if (examMode === OFFICIAL_EXAM_MODE && lockdownMode === OFFICIAL_EXAM_LOCKDOWN_MODE) {
    return t(
      "tenant.createExam.POLICY_OFFICIAL_STRICT",
      CREATE_EXAM_WIZARD_TEXT.POLICY_OFFICIAL_STRICT,
    );
  }
  return t("tenant.createExam.POLICY_UNAVAILABLE", CREATE_EXAM_WIZARD_TEXT.POLICY_UNAVAILABLE);
}
