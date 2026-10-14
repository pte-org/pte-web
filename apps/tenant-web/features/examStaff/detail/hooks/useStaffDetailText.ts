"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import { STAFF_DETAIL_EN, type StaffDetailMessageKey, type StaffDetailMessages } from "../messages/en";
import { STAFF_DETAIL_VI } from "../messages/vi";

export interface StaffDetailText extends StaffDetailMessages {
  locale: Locale;
  format: (key: StaffDetailMessageKey, values: Record<string, string | number>) => string;
}

export const useStaffDetailText = (): StaffDetailText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? STAFF_DETAIL_VI : STAFF_DETAIL_EN;
    // Both catalogs cover every StaffDetailMessageKey; translation preserves that complete key set.
    const messages = Object.fromEntries(Object.entries(catalog).map(([key, fallback]) =>
      [key, t(`tenant.examStaffDetail.${key}`, fallback)],
    )) as StaffDetailMessages;
    return {
      ...messages, locale,
      format: (key, values) => t(`tenant.examStaffDetail.${key}`, catalog[key], values),
    };
  }, [locale, t]);
};
