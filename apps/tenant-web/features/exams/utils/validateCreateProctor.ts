import { CREATE_PROCTOR_ERRORS } from "../constants";
import type { CreateProctorErrors, CreateProctorInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateCreateProctor(input: CreateProctorInput): CreateProctorErrors {
  const errors: CreateProctorErrors = {};

  if (!input.email.trim()) {
    errors.email = CREATE_PROCTOR_ERRORS.EMAIL_REQUIRED;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = CREATE_PROCTOR_ERRORS.EMAIL_INVALID;
  }
  if (!input.fullName.trim()) {
    errors.fullName = CREATE_PROCTOR_ERRORS.FULL_NAME_REQUIRED;
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = CREATE_PROCTOR_ERRORS.PASSWORD_TOO_SHORT;
  }

  return errors;
}
