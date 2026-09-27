import { getUserFacingApiErrorMessage } from "@pte/api-client";

/** Marks copy produced by a local parser or an explicitly user-facing domain result. */
export class UserFacingError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super("A user-facing operation failed.");
    this.name = "UserFacingError";
    this.userMessage = userMessage;
  }
}

/** Undefined only when `error` itself is falsy (no error) — so `errorMessage(x) && <Alert>`
 * and `{!!x && <Alert>{errorMessage(x, fallback)}</Alert>}` both work correctly. */
export function errorMessage(
  error: unknown,
  fallback = "We couldn't complete this action. Please try again.",
): string | undefined {
  if (!error) return undefined;
  if (error instanceof UserFacingError) return error.userMessage;
  return getUserFacingApiErrorMessage(error, fallback);
}
