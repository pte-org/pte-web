"use client";

import { useLocale } from "@pte/ui";
import { ABOUT_PTE_EN, type AboutPteCopy } from "../constants/aboutPteCopy.en";
import { ABOUT_PTE_VI } from "../constants/aboutPteCopy.vi";

export const useAboutPteCopy = (): AboutPteCopy => {
  const { locale } = useLocale();
  return locale === "vi" ? ABOUT_PTE_VI : ABOUT_PTE_EN;
};
