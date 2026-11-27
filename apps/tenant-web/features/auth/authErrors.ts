import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import type { AuthErrorText } from "./authVietnamese";

/** The sentences a password field can fail with, in the language of the screen. */
export interface PasswordProblemText {
  required: string;
  tooShort: string;
  edgeSpaces: string;
  tooLong: string;
}

const RATE_LIMITED_STATUS = 429;
const SERVER_ERROR_STATUS = 500;
const INVALID_RESET_TOKEN_CODE = "INVALID_PASSWORD_RESET_TOKEN";

/** The API's English validation sentences for a password, matched so a Vietnamese reader gets Vietnamese. */
const SERVER_PASSWORD_PROBLEMS: ReadonlyArray<readonly [RegExp, keyof PasswordProblemText]> = [
  [/at least 8 characters/i, "tooShort"],
  [/start or end with a space/i, "edgeSpaces"],
  [/at most 72 bytes/i, "tooLong"],
  [/is required/i, "required"],
];
/**
 * The text for a failed password request. English keeps using the shared API catalog; Vietnamese maps the
 * failures a visitor can hit here (no connection, too many tries, server trouble, an expired link) and otherwise
 * shows {@code fallback}, the screen's own message, instead of an untranslated server sentence.
 */
export const getAuthFailureMessage = (
  error: unknown,
  fallback: string,
  locale: string,
  text: AuthErrorText,
  problems?: PasswordProblemText,
): string => {
  if (locale !== "vi") return getUserFacingApiErrorMessage(error, fallback);
  if (error instanceof ApiError) {
    if (error.kind === "network" || error.status === 0) return text.networkError;
    if (error.status === RATE_LIMITED_STATUS) return text.rateLimited;
    if (error.kind === "server" || error.status >= SERVER_ERROR_STATUS) return text.serviceUnavailable;
    if (error.code === INVALID_RESET_TOKEN_CODE) return text.invalidLink;
    if (problems && error.kind === "validation") {
      const match = SERVER_PASSWORD_PROBLEMS.find(([pattern]) => pattern.test(error.message));
      if (match) return problems[match[1]];
    }
  }
  return fallback;
};
