export const MIN_PASSWORD_LENGTH = 8;

export type NewPasswordProblem = "REQUIRED" | "TOO_SHORT" | "EDGE_SPACES" | "MISMATCH";

/** Usernames and e-mail addresses never hold whitespace, so a typed or pasted one is dropped as it arrives. */
export function withoutSpaces(value: string): string {
  return value.replace(/\s+/g, "");
}

/** A space at either end of a password is almost always a copy-paste slip; the API refuses it too. */
export function hasEdgeSpaces(password: string): boolean {
  return password !== password.trim();
}

/** What is wrong with a new password and its confirmation, or null when both are fine. */
export function validateNewPassword(
  newPassword: string,
  confirmation: string,
): NewPasswordProblem | null {
  if (!newPassword || !confirmation) return "REQUIRED";
  if (newPassword.length < MIN_PASSWORD_LENGTH) return "TOO_SHORT";
  if (hasEdgeSpaces(newPassword)) return "EDGE_SPACES";
  if (newPassword !== confirmation) return "MISMATCH";
  return null;
}

/**
 * Sends the reset request for one account (its username and the e-mail on it) and always answers SENT once it was
 * attempted, even if the call failed: the screen must look the same whether or not the account exists, and a
 * failure would otherwise be a signal.
 */
export async function submitForgotPassword(
  email: string,
  username: string,
  send: (email: string, username: string) => Promise<unknown>,
): Promise<"SENT" | "EMAIL_REQUIRED" | "USERNAME_REQUIRED"> {
  const address = email.trim();
  const account = username.trim();
  if (!address) return "EMAIL_REQUIRED";
  if (!account) return "USERNAME_REQUIRED";
  try {
    await send(address, account);
  } catch {
    // Deliberately swallowed; see above.
  }
  return "SENT";
}

export type ResetLinkState = "checking" | "usable" | "unusable";

/**
 * What the reset page should show for a link. A link is refused only when the server says so (or there is no
 * token); if the check itself fails, the page still lets the person try, because the final step is the authority.
 */
export function resolveResetLinkState(
  token: string,
  check: { isPending: boolean; data?: { valid: boolean } },
): ResetLinkState {
  if (!token) return "unusable";
  if (check.isPending) return "checking";
  return check.data?.valid === false ? "unusable" : "usable";
}
