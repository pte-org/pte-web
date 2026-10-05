"use client";

import { ApiError } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { IMPORT_OR_ASSIGN_TEXT } from "../constants";

const STUDENT_ALREADY_IN_CLASS_CODE = "STUDENT_ALREADY_IN_CLASS";

/**
 * `STUDENT_ALREADY_IN_CLASS` deserves friendlier copy than the generic
 * transport error, and this is the only place that knows the code, so the
 * mapping lives here rather than in each of the two tabs that assign.
 */
export function isAlreadyInClassError(error: unknown): boolean {
  return error instanceof ApiError && error.code === STUDENT_ALREADY_IN_CLASS_CODE;
}

export function assignErrorMessage(error: unknown): string | undefined {
  if (isAlreadyInClassError(error)) return IMPORT_OR_ASSIGN_TEXT.alreadyInAnotherClass;
  return errorMessage(error);
}
