import { RESET_PASSWORD_ERRORS } from "../constants";
import type { ResetPasswordErrors, ResetPasswordInput } from "../types";

const MIN_PASSWORD_LENGTH = 8;

export function validateResetPassword(input: ResetPasswordInput): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};

  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = RESET_PASSWORD_ERRORS.PASSWORD_TOO_SHORT;
  }

  return errors;
}
