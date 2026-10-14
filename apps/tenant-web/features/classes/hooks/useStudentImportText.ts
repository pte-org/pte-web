"use client";

import { useLocale } from "@pte/ui";
import {
  STUDENT_IMPORT_EN,
  STUDENT_IMPORT_VI,
  type StudentImportMessages,
} from "../constants/studentImportMessages";

export const useStudentImportText = (): StudentImportMessages => {
  const { locale, t } = useLocale();
  const catalog = locale === "vi" ? STUDENT_IMPORT_VI : STUDENT_IMPORT_EN;
  return Object.fromEntries(
    Object.entries(catalog).map(([key, fallback]) => [
      key,
      t(`tenant.studentImport.${key}`, fallback),
    ]),
  ) as StudentImportMessages;
};
