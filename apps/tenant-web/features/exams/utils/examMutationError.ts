import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { EXAM_EDITOR_TEXT } from "../constants";

export type Translate = (key: string, fallback?: string) => string;

const EXAM_ERROR_TRANSLATIONS = {
  TEMPLATE_NOT_ACTIVE: {
    key: "tenant.examDetails.templateNotActive",
    fallback: EXAM_EDITOR_TEXT.TEMPLATE_NOT_ACTIVE,
  },
  LOCKDOWN_MODE_INVALID_FOR_EXAM_MODE: {
    key: "tenant.examDetails.lockdownModeInvalid",
    fallback: EXAM_EDITOR_TEXT.LOCKDOWN_MODE_INVALID,
  },
  LOCKDOWN_MODE_REQUIRED: {
    key: "tenant.examDetails.lockdownModeRequired",
    fallback: EXAM_EDITOR_TEXT.LOCKDOWN_MODE_REQUIRED,
  },
  EXAM_CLOSE_TIME_NOT_EXTENDED: {
    key: "tenant.examDetails.closeTimeNotExtended",
    fallback: EXAM_EDITOR_TEXT.CLOSE_TIME_NOT_EXTENDED,
  },
} as const;

export const getExamMutationErrorMessage = (error: unknown, t: Translate): string => {
  const code = error instanceof ApiError ? error.code : undefined;
  const translation = code
    ? EXAM_ERROR_TRANSLATIONS[code as keyof typeof EXAM_ERROR_TRANSLATIONS]
    : undefined;
  if (translation) return t(translation.key, translation.fallback);

  return getUserFacingApiErrorMessage(
    error,
    t("tenant.examDetails.saveFailed", EXAM_EDITOR_TEXT.SAVE_FAILED),
  );
};
