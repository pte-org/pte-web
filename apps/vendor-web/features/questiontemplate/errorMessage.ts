import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { QUESTION_TYPE_ERROR_MESSAGES } from "./constants";

/**
 * Converts catalog error codes into task-type language before the shared API
 * fallback runs. Codes remain available on ApiError for telemetry and logic;
 * they are never the primary copy shown to platform users.
 */
export function getQuestionTypeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code) {
    const message = QUESTION_TYPE_ERROR_MESSAGES[error.code];
    if (message) return message;
  }
  return getUserFacingApiErrorMessage(error, fallback);
}
