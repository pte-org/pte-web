"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import {
  SCORING_ACTION_EN,
  SCORING_ACTION_VI,
  type ScoringActionMessageKey,
  type ScoringActionMessages,
} from "../messages/scoringActions";

export interface ScoringActionText extends ScoringActionMessages {
  locale: Locale;
  /** A message with its {count} filled in. */
  withCount: (key: "rescoreDescription" | "rescoreButton", count: number) => string;
}

/** The AI scoring buttons' text in the language the user picked. */
export const useScoringActionText = (): ScoringActionText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? SCORING_ACTION_VI : SCORING_ACTION_EN;
    const messages = Object.fromEntries(
      (Object.keys(catalog) as ScoringActionMessageKey[]).map((key) => [
        key,
        t(`tenant.examScoringActions.${key}`, catalog[key]),
      ]),
    ) as ScoringActionMessages;
    return {
      ...messages,
      locale,
      withCount: (key, count) => t(`tenant.examScoringActions.${key}`, catalog[key], { count }),
    };
  }, [locale, t]);
};
