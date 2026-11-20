import { ADD_STUDENT_ERRORS } from "../constants";
import type { AddStudentErrors, AddStudentInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation for the "Add Students → Add Individually" form.
 *
 * Students are created without a local password. Other fields collected by
 * the form (studentCode, phone, dateOfBirth) are optional.
 */
export function validateAddStudentInput(
  input: AddStudentInput,
  messages: Record<keyof typeof ADD_STUDENT_ERRORS, string> = ADD_STUDENT_ERRORS,
): AddStudentErrors {
  const errors: AddStudentErrors = {};

  if (!input.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = messages.emailInvalid;
  }
  if (!input.fullName.trim()) {
    errors.fullName = messages.fullNameRequired;
  }

  return errors;
}
