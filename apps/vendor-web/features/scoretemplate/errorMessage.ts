import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { SCORE_TEMPLATE_ERROR_MESSAGES } from "./constants";

/**
 * Keeps score-template/profile codes useful for control flow while presenting
 * non-technical guidance to authors and platform administrators.
 */
export function getScoreTemplateErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code) {
    const message = SCORE_TEMPLATE_ERROR_MESSAGES[error.code];
    if (message) return message;
  }
  return getUserFacingApiErrorMessage(error, fallback);
}
