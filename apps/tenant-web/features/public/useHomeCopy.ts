"use client";

import { useLocale } from "@pte/ui";
import { HOME_PREVIEW, HOME_STEPS, HOME_TEXT } from "./homeConstants";
import { HOME_PREVIEW_VI, HOME_STEPS_VI, HOME_TEXT_VI } from "./homeVietnamese";

export const useHomeCopy = () => {
  const { locale } = useLocale();
  return {
    locale,
    HOME_TEXT: locale === "vi" ? HOME_TEXT_VI : HOME_TEXT,
    HOME_PREVIEW: locale === "vi" ? HOME_PREVIEW_VI : HOME_PREVIEW,
    HOME_STEPS: locale === "vi" ? HOME_STEPS_VI : HOME_STEPS,
  };
};
