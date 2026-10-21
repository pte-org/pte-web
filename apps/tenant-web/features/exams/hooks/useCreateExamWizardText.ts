"use client";

import { useMemo } from "react";
import { useLocale } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT as DEFAULT_CREATE_EXAM_WIZARD_TEXT } from "../constants";

export type CreateExamWizardText = typeof DEFAULT_CREATE_EXAM_WIZARD_TEXT;

/** The wizard copy resolved against the active locale, falling back to the English defaults. */
export function useCreateExamWizardText(): CreateExamWizardText {
  const { t } = useLocale();
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DEFAULT_CREATE_EXAM_WIZARD_TEXT).map(([key, value]) => [
          key,
          typeof value === "string" ? t(`tenant.createExam.${key}`, value) : value,
        ]),
      ) as CreateExamWizardText,
    [t],
  );
}
