import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import type { RubricEditText } from "./versionTypes";

export function rubricVersionError(error: unknown, text: RubricEditText): string {
  if (error instanceof ApiError && ["RUBRIC_DIFF_STALE", "RUBRIC_VERSION_CONCURRENT_CHANGE"].includes(error.code ?? "")) return text.stale;
  return getUserFacingApiErrorMessage(error, text.error);
}
