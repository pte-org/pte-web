import { ApiError } from "@pte/api-client";

interface StartMessages {
  startErrorAlreadyRunning: string;
  startErrorTooManyJobs: string;
  startErrorDailyLimit: string;
  startErrorGlobalLimit: string;
  startError: string;
}

const BY_CODE: Record<string, keyof StartMessages> = {
  GENERATION_JOB_ALREADY_RUNNING: "startErrorAlreadyRunning",
  GENERATION_TOO_MANY_JOBS: "startErrorTooManyJobs",
  GENERATION_DAILY_LIMIT_REACHED: "startErrorDailyLimit",
  GENERATION_GLOBAL_LIMIT_REACHED: "startErrorGlobalLimit",
};

/** Why a generation could not be started, in the person's words; an unknown refusal gets the general message. */
export function generationStartError(error: unknown, messages: StartMessages): string {
  const key = error instanceof ApiError && error.code ? BY_CODE[error.code] : undefined;
  return messages[key ?? "startError"];
}
