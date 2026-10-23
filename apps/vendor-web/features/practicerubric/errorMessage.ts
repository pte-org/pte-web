import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { PRACTICE_RUBRIC_ERROR_MESSAGES } from "./constants";

export function getPracticeRubricErrorMessage(error: unknown, fallback: string,
  localizedMessages: Record<string, string> = PRACTICE_RUBRIC_ERROR_MESSAGES): string {
  if (error instanceof ApiError && error.code) {
    const message = PRACTICE_RUBRIC_ERROR_MESSAGES[error.code] ?? getUserFacingApiErrorMessage(error, fallback);
    return localizedMessages[message] ?? message;
  }
  const message = getUserFacingApiErrorMessage(error, fallback);
  return localizedMessages[message] ?? message;
}
