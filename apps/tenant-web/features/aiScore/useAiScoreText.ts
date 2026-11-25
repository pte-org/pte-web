"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import type { AiScoreStatus } from "@pte/api-client";
import { AI_SCORE_EN, AI_SCORE_VI, type AiScoreMessageKey, type AiScoreMessages } from "./messages";

export interface AiScoreText extends AiScoreMessages {
  locale: Locale;
  statusLabel: (status: AiScoreStatus) => string;
  failureReasonOf: (code: string) => string;
}

/** The AI score detail's text in the language the user picked. */
export const useAiScoreText = (): AiScoreText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? AI_SCORE_VI : AI_SCORE_EN;
    const messages = Object.fromEntries(
      (Object.keys(catalog) as AiScoreMessageKey[]).map((key) => [key, t(`tenant.aiScore.${key}`, catalog[key])]),
    ) as AiScoreMessages;
    const statusLabels: Record<AiScoreStatus, string> = {
      PENDING: messages.statusPending,
      SCORING: messages.statusScoring,
      FAILED: messages.statusFailed,
      SCORED: messages.statusScored,
    };
    return {
      ...messages,
      locale,
      statusLabel: (status) => statusLabels[status],
      failureReasonOf: (code) => t("tenant.aiScore.failureReason", catalog.failureReason, { code }),
    };
  }, [locale, t]);
};
