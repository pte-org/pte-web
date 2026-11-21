"use client";

import { useLocale } from "@pte/ui";
import { ABOUT_PTE_EN, type AboutPteCopy } from "../constants/aboutPteCopy.en";
import { ABOUT_PTE_VI } from "../constants/aboutPteCopy.vi";
import { ABOUT_PTE_LANDING_EN, type AboutPteLanding } from "../constants/aboutPteLanding.en";
import { ABOUT_PTE_LANDING_VI } from "../constants/aboutPteLanding.vi";

export const useAboutPteCopy = (): AboutPteCopy => {
  const { locale } = useLocale();
  return locale === "vi" ? ABOUT_PTE_VI : ABOUT_PTE_EN;
};

export const useAboutPteLanding = (): AboutPteLanding => {
  const { locale } = useLocale();
  return locale === "vi" ? ABOUT_PTE_LANDING_VI : ABOUT_PTE_LANDING_EN;
};
