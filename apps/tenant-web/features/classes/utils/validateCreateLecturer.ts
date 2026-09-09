import { CREATE_LECTURER_ERRORS } from "../constants";
import type { CreateLecturerErrors, CreateLecturerInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateCreateLecturer(input: CreateLecturerInput): CreateLecturerErrors {
  const errors: CreateLecturerErrors = {};

  if (!input.email.trim()) {
    errors.email = CREATE_LECTURER_ERRORS.emailRequired;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = CREATE_LECTURER_ERRORS.emailInvalid;
  }
  if (!input.fullName.trim()) {
    errors.fullName = CREATE_LECTURER_ERRORS.fullNameRequired;
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = CREATE_LECTURER_ERRORS.passwordTooShort;
  }

  return errors;
}
