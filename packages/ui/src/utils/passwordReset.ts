export const MIN_PASSWORD_LENGTH = 8;

export type NewPasswordProblem = "REQUIRED" | "TOO_SHORT" | "MISMATCH";

/** What is wrong with a new password and its confirmation, or null when both are fine. */
export function validateNewPassword(
  newPassword: string,
  confirmation: string,
): NewPasswordProblem | null {
  if (!newPassword || !confirmation) return "REQUIRED";
  if (newPassword.length < MIN_PASSWORD_LENGTH) return "TOO_SHORT";
  if (newPassword !== confirmation) return "MISMATCH";
  return null;
}

/**
 * Sends the reset request and always answers SENT once it was attempted, even if the call failed: the screen must
 * look the same whether or not the address has an account, and a failure would otherwise be a signal.
 */
export async function submitForgotPassword(
  email: string,
  send: (email: string) => Promise<unknown>,
): Promise<"SENT" | "EMAIL_REQUIRED"> {
  const address = email.trim();
  if (!address) return "EMAIL_REQUIRED";
  try {
    await send(address);
  } catch {
    // Deliberately swallowed; see above.
  }
  return "SENT";
}
