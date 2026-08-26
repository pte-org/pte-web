import { CREATE_LOGIN_ACCOUNT_ERRORS } from "../constants";
import type { CreateLoginAccountErrors, CreateLoginAccountInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateCreateLoginAccount(
  input: CreateLoginAccountInput,
): CreateLoginAccountErrors {
  const errors: CreateLoginAccountErrors = {};

  if (!input.email.trim()) {
    errors.email = CREATE_LOGIN_ACCOUNT_ERRORS.REQUIRED;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = CREATE_LOGIN_ACCOUNT_ERRORS.EMAIL_INVALID;
  }

  if (!input.fullName.trim()) errors.fullName = CREATE_LOGIN_ACCOUNT_ERRORS.REQUIRED;

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = CREATE_LOGIN_ACCOUNT_ERRORS.PASSWORD_TOO_SHORT;
  }

  return errors;
}
