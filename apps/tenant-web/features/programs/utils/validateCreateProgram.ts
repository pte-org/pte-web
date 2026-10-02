import { CREATE_PROGRAM_ERRORS } from "../constants";
import type { CreateProgramErrors, CreateProgramInput } from "../types";

export function validateCreateProgram(
  input: CreateProgramInput,
  programLabel: string,
): CreateProgramErrors {
  const errors: CreateProgramErrors = {};

  if (!input.name.trim()) {
    errors.name = CREATE_PROGRAM_ERRORS.nameRequired(programLabel);
  }

  if (!input.startDate) {
    errors.startDate = CREATE_PROGRAM_ERRORS.startDateRequired;
  }

  if (!input.endDate) {
    errors.endDate = CREATE_PROGRAM_ERRORS.endDateRequired;
  } else if (input.startDate && new Date(input.endDate) <= new Date(input.startDate)) {
    errors.endDate = CREATE_PROGRAM_ERRORS.endDateBeforeStartDate;
  }

  return errors;
}
