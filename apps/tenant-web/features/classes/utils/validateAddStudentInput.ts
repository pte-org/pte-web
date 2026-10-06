import { CREATE_LECTURER_ERRORS } from "../constants";
import type { AddStudentErrors, AddStudentInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation for the "Add Students → Add Individually" form.
 *
 * Mirrors `validateCreateLecturer` (same email/fullName rules, same copy) but without
 * the password field — students are created without a local password. Everything else
 * the form collects (studentCode, phone, dateOfBirth) is optional.
 */
export function validateAddStudentInput(input: AddStudentInput): AddStudentErrors {
  const errors: AddStudentErrors = {};

  if (!input.email.trim()) {
    errors.email = CREATE_LECTURER_ERRORS.emailRequired;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = CREATE_LECTURER_ERRORS.emailInvalid;
  }
  if (!input.fullName.trim()) {
    errors.fullName = CREATE_LECTURER_ERRORS.fullNameRequired;
  }

  return errors;
}
