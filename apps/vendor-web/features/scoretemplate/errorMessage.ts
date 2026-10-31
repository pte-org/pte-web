import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { SCORE_TEMPLATE_ERROR_MESSAGES } from "./constants";

/** The save endpoint rejects a skill-weight column that does not total exactly 100. */
const WEIGHT_TOTAL_PATTERN = /must total exactly 100/i;

/**
 * Keeps score-template/profile codes useful for control flow while presenting
 * non-technical guidance to authors and platform administrators.
 */
export function getScoreTemplateErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code) {
    if (error.code === "SCORE_TEMPLATE_VALIDATION_FAILED" && WEIGHT_TOTAL_PATTERN.test(error.message)) {
      return SCORE_TEMPLATE_ERROR_MESSAGES.SKILL_WEIGHT_TOTAL_NOT_100;
    }
    const message = SCORE_TEMPLATE_ERROR_MESSAGES[error.code];
    if (message) return message;
  }
  return getUserFacingApiErrorMessage(error, fallback);
}
