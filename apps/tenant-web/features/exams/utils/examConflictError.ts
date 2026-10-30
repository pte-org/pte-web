import { ApiError } from "@pte/api-client";
import { EXAM_CONFLICT_TEXT } from "../constants/examConflict";

type Translate = (key: string, fallback?: string) => string;
interface ConflictExam {
  conflictingSessionPublicId: string;
  conflictingSessionName?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatExamConflictNames(conflicts: readonly ConflictExam[], t: Translate): string {
  const exams = new Map<string, string>();
  for (const conflict of conflicts) {
    exams.set(
      conflict.conflictingSessionPublicId,
      conflict.conflictingSessionName?.trim() || conflict.conflictingSessionPublicId,
    );
  }
  return exams.size === 0
    ? ""
    : t("tenant.examConflict.sessions", EXAM_CONFLICT_TEXT.SESSIONS).replace(
        "{exams}",
        [...exams.values()].join("; "),
      );
}

export function getExamConflictErrorMessage(error: unknown, t: Translate): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (error.code !== "EXAM_AUDIENCE_CONFLICT" && error.code !== "SESSION_TIME_CONFLICT")
    return undefined;
  const audience = error.code === "EXAM_AUDIENCE_CONFLICT";
  const summary = audience
    ? t("tenant.examConflict.audience", EXAM_CONFLICT_TEXT.AUDIENCE)
    : t("tenant.examConflict.schedule", EXAM_CONFLICT_TEXT.SCHEDULE);
  const data: unknown = isRecord(error.details) ? error.details.data : undefined;
  const conflicts: ConflictExam[] = [];
  if (Array.isArray(data) || isRecord(data)) {
    for (const item of Array.isArray(data) ? data : [data]) {
      if (!isRecord(item) || typeof item.conflictingSessionPublicId !== "string") continue;
      conflicts.push({
        conflictingSessionPublicId: item.conflictingSessionPublicId,
        conflictingSessionName:
          typeof item.conflictingSessionName === "string" ? item.conflictingSessionName : undefined,
      });
    }
  } else if (typeof data === "string" && data.trim()) {
    conflicts.push({ conflictingSessionPublicId: data });
  }
  return [summary, formatExamConflictNames(conflicts, t)].filter(Boolean).join(" ");
}
