import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import type { BatchMessages } from "../messages/en";
import type { BatchMessageKey } from "../types";

/** Batch refusals with localized copy; other codes go through the shared catalog. */
const BATCH_ERROR_KEYS: Record<string, BatchMessageKey> = {
  GENERATION_JOB_ALREADY_RUNNING: "createAlreadyOpen",
  GENERATION_BATCH_DISABLED: "batchDisabled",
  GENERATION_DISABLED: "generationDisabled",
  GENERATION_DAILY_LIMIT_REACHED: "dailyLimit",
  GENERATION_GLOBAL_LIMIT_REACHED: "globalLimit",
  GENERATION_PICTURE_DISABLED: "errPicture",
  GENERATION_BATCH_SIZE_OUT_OF_RANGE: "errTotal",
  GENERATION_BATCH_ROWS_OUT_OF_RANGE: "errRows",
  GENERATION_BATCH_TOPIC_HINTS_OUT_OF_RANGE: "errTopicCount",
  GENERATION_TOPIC_HINT_INVALID: "errTopicChars",
};

export function apiErrorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined;
}

/** What to tell the person when a batch call fails; never a raw code. */
export function batchErrorMessage(error: unknown, messages: BatchMessages, fallback: BatchMessageKey): string {
  const code = apiErrorCode(error);
  const key = code ? BATCH_ERROR_KEYS[code] : undefined;
  if (key) return messages[key];
  return getUserFacingApiErrorMessage(error, messages[fallback]);
}
