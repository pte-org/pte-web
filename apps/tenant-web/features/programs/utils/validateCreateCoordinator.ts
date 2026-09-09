import { CREATE_COORDINATOR_ERRORS } from "../constants";
import type { CreateCoordinatorErrors, CreateCoordinatorInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateCreateCoordinator(input: CreateCoordinatorInput): CreateCoordinatorErrors {
  const errors: CreateCoordinatorErrors = {};

  if (!input.email.trim()) {
    errors.email = CREATE_COORDINATOR_ERRORS.emailRequired;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = CREATE_COORDINATOR_ERRORS.emailInvalid;
  }
  if (!input.fullName.trim()) {
    errors.fullName = CREATE_COORDINATOR_ERRORS.fullNameRequired;
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = CREATE_COORDINATOR_ERRORS.passwordTooShort;
  }

  return errors;
}
