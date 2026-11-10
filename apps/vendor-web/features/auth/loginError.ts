import { ApiError } from "@pte/api-client";
import { AUTH_TEXT } from "./constants";

/** On login, 401 and 400 both mean "bad credentials" — collapse to one generic message so the UI never reveals whether an account exists. */
type LoginErrorText = Record<
  "INVALID_CREDENTIALS" | "GENERIC_ERROR" | "NETWORK_ERROR" | "SERVICE_UNAVAILABLE" | "RATE_LIMITED", string>;

export function getLoginErrorMessage(error: unknown, text: LoginErrorText = AUTH_TEXT): string {
  if (error instanceof ApiError) {
    if (error.kind === "network" || error.status === 0) return text.NETWORK_ERROR;
    if (error.status === 429) return text.RATE_LIMITED;
    if (error.kind === "server" || error.status >= 500) return text.SERVICE_UNAVAILABLE;
    if (error.kind === "unauthorized" || error.kind === "validation") {
      return text.INVALID_CREDENTIALS;
    }
  }
  return text.GENERIC_ERROR;
}
