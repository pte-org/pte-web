import { UserFacingError } from "@/features/examoperations/errorMessage";
import { CREATE_EXAM_WIZARD_TEXT } from "../constants";
import type {
  AudienceMemberResponse,
  SlotConflict,
  ScoreTemplateSlotFeasibilityResponse,
} from "@pte/api-client";

/**
 * Preflight found blockers. Keeps the raw issue codes so the UI can render them in the active
 * locale; `userMessage` is the English text for callers that have no locale context.
 */
export class ExamPreflightBlockedError extends UserFacingError {
  readonly issues: readonly string[];
  readonly shortages: readonly ScoreTemplateSlotFeasibilityResponse[];
  readonly conflicts: readonly SlotConflict[];

  constructor(
    issues: readonly string[],
    shortages: readonly ScoreTemplateSlotFeasibilityResponse[] = [],
    audience: readonly AudienceMemberResponse[] = [],
  ) {
    super(
      composePreflightMessage(
        CREATE_EXAM_WIZARD_TEXT.PREFLIGHT_BLOCKED,
        issues,
        (issue) => CREATE_EXAM_WIZARD_TEXT.PREFLIGHT_ISSUE_MESSAGES[issue],
      ),
    );
    this.issues = issues;
    this.shortages = shortages.filter((slot) => !slot.ready);
    this.conflicts = audience.flatMap((member) =>
      member.reason === "SCHEDULE_OVERLAP" && member.priorSessionPublicId
        ? [
            {
              studentPublicId: member.studentPublicId,
              conflictingSessionPublicId: member.priorSessionPublicId,
              conflictingSessionName: member.priorSessionName ?? member.priorSessionPublicId,
            },
          ]
        : [],
    );
  }
}

export function composePreflightMessage(
  summary: string,
  issues: readonly string[],
  describe: (issue: string) => string | undefined,
): string {
  const details = issues.map(describe).filter((message): message is string => Boolean(message));
  return details.length > 0 ? `${summary} ${details.join(" ")}` : summary;
}
