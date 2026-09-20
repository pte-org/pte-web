import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { AUTH_TEXT } from "./constants";

/** On login, 401 and 400 both mean "bad credentials" — collapse to one generic message so the UI never reveals whether an account exists. */
export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === "unauthorized" || error.kind === "validation") {
      return AUTH_TEXT.INVALID_CREDENTIALS;
    }
    return getUserFacingApiErrorMessage(error, AUTH_TEXT.GENERIC_ERROR);
  }
  return getUserFacingApiErrorMessage(error, AUTH_TEXT.GENERIC_ERROR);
}
