import { CREATE_PROGRAM_ERRORS } from "../constants";
import type { CreateProgramErrors, CreateProgramInput } from "../types";

/**
 * Both dates are optional: a Program may be open-ended, so only the *relative* order is
 * validated. A Program is also allowed to start and end on the same day, so the ordering
 * check is a strict `<` rather than `<=`.
 */
export function validateCreateProgram(
  input: CreateProgramInput,
  programLabel: string,
): CreateProgramErrors {
  const errors: CreateProgramErrors = {};

  if (!input.name.trim()) {
    errors.name = CREATE_PROGRAM_ERRORS.nameRequired(programLabel);
  }

  if (input.startDate && input.endDate && new Date(input.endDate) < new Date(input.startDate)) {
    errors.endDate = CREATE_PROGRAM_ERRORS.endDateBeforeStartDate;
  }

  return errors;
}
