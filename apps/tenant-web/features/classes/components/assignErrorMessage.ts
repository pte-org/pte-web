"use client";

import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { IMPORT_OR_ASSIGN_TEXT } from "../constants";
import type { StudentImportMessages } from "../constants/studentImportMessages";

const STUDENT_ALREADY_IN_CLASS_CODE = "STUDENT_ALREADY_IN_CLASS";

/**
 * `STUDENT_ALREADY_IN_CLASS` deserves friendlier copy than the generic
 * transport error, and this is the only place that knows the code, so the
 * mapping lives here rather than in each of the two tabs that assign.
 */
export function isAlreadyInClassError(error: unknown): boolean {
  return error instanceof ApiError && error.code === STUDENT_ALREADY_IN_CLASS_CODE;
}

export function assignErrorMessage(
  error: unknown,
  currentClassPublicId?: string,
  text: Pick<StudentImportMessages, "alreadyInThisClass" | "alreadyInAnotherClass" | "alreadyAssigned"> = IMPORT_OR_ASSIGN_TEXT,
): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && isAlreadyInClassError(error)) {
    const details = error.details;
    const data = typeof details === "object" && details !== null && "data" in details
      ? details.data : undefined;
    const classPublicId = typeof data === "object" && data !== null && "existingClassPublicId" in data
      && typeof data.existingClassPublicId === "string" ? data.existingClassPublicId : undefined;
    if (!classPublicId || !currentClassPublicId) return text.alreadyAssigned;
    return classPublicId === currentClassPublicId ? text.alreadyInThisClass : text.alreadyInAnotherClass;
  }
  return getUserFacingApiErrorMessage(error);
}
