"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import {
  EXAMINER_WORKSPACE_EN,
  type ExaminerWorkspaceMessageKey,
  type ExaminerWorkspaceMessages,
} from "../messages/en";
import { EXAMINER_WORKSPACE_VI } from "../messages/vi";

export interface ExaminerWorkspaceText extends ExaminerWorkspaceMessages {
  locale: Locale;
  format: (key: ExaminerWorkspaceMessageKey, values: Record<string, string | number>) => string;
}

export const useExaminerWorkspaceText = (): ExaminerWorkspaceText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? EXAMINER_WORKSPACE_VI : EXAMINER_WORKSPACE_EN;
    const messages = Object.fromEntries(
      Object.entries(catalog).map(([key, fallback]) => [
        key,
        t(`tenant.examinerWorkspace.${key}`, fallback),
      ]),
    ) as ExaminerWorkspaceMessages;
    return {
      ...messages,
      locale,
      format: (key, values) => t(`tenant.examinerWorkspace.${key}`, catalog[key], values),
    };
  }, [locale, t]);
};
