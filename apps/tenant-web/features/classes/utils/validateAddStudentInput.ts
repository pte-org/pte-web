import { ADD_STUDENT_ERRORS } from "../constants";
import type { AddStudentErrors, AddStudentInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation for the "Add Students → Add Individually" form.
 *
 * Students are created without a local password. Other fields collected by
 * the form (studentCode, phone, dateOfBirth) are optional.
 */
export function validateAddStudentInput(input: AddStudentInput): AddStudentErrors {
  const errors: AddStudentErrors = {};

  if (!input.email.trim()) {
    errors.email = ADD_STUDENT_ERRORS.emailRequired;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = ADD_STUDENT_ERRORS.emailInvalid;
  }
  if (!input.fullName.trim()) {
    errors.fullName = ADD_STUDENT_ERRORS.fullNameRequired;
  }

  return errors;
}
