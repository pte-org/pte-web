"use client";

import { useLocale } from "@pte/ui";
import { PROGRAM_DETAIL_EN, PROGRAM_DETAIL_VI, type ProgramDetailMessages } from "../constants/detailMessages";

export const useProgramDetailText = () => {
  const { locale, t } = useLocale();
  const catalog = locale === "vi" ? PROGRAM_DETAIL_VI : PROGRAM_DETAIL_EN;
  const text = Object.fromEntries(Object.entries(catalog).map(([key, value]) =>
    [key, t(`tenant.programDetail.${key}`, value)],
  )) as ProgramDetailMessages;
  return {
    ...text, locale,
    archiveImpact: (classes: number, students: number) =>
      t("tenant.programDetail.archiveDescription", catalog.archiveDescription, { classes, students }),
  };
};
