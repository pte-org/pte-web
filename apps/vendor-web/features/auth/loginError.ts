import { ApiError } from "@pte/api-client";
import { AUTH_TEXT } from "./constants";

/**
 * Map a thrown error to a user-facing login message. On login, both 401 and 400
 * mean "bad credentials" — collapse them to one generic message so the UI never
 * reveals whether an account exists (US-001 no account-existence leak).
 */
export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === "unauthorized" || error.kind === "validation") {
      return AUTH_TEXT.INVALID_CREDENTIALS;
    }
    return error.message;
  }
  return AUTH_TEXT.GENERIC_ERROR;
}
