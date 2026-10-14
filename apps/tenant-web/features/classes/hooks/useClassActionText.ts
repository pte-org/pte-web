"use client";

import { useLocale } from "@pte/ui";
import { CLASS_ACTION_EN, CLASS_ACTION_VI, type ClassActionMessages } from "../constants/actionMessages";

export const useClassActionText = () => {
  const { locale, t } = useLocale();
  const catalog = locale === "vi" ? CLASS_ACTION_VI : CLASS_ACTION_EN;
  const messages = Object.fromEntries(Object.entries(catalog).map(([key, fallback]) =>
    [key, t(`tenant.classActions.${key}`, fallback)],
  )) as ClassActionMessages;
  return {
    ...messages,
    format: (key: keyof ClassActionMessages, values: Record<string, string | number>) =>
      t(`tenant.classActions.${key}`, catalog[key], values),
  };
};
