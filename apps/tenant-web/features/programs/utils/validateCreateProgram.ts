import { CREATE_PROGRAM_ERRORS } from "../constants";
import type { CreateProgramErrors, CreateProgramInput } from "../types";

export function validateCreateProgram(input: CreateProgramInput, programLabel: string): CreateProgramErrors {
  const errors: CreateProgramErrors = {};

  if (!input.name.trim()) {
    errors.name = CREATE_PROGRAM_ERRORS.nameRequired(programLabel);
  }

  return errors;
}
