"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import { formatMessage, type MessageValues } from "../explanationView";
import {
  SCORE_EXPLANATION_EN,
  type ScoreExplanationMessageKey,
  type ScoreExplanationMessages,
} from "../messages/en";
import { SCORE_EXPLANATION_VI } from "../messages/vi";

export interface ScoreExplanationText {
  locale: Locale;
  messages: ScoreExplanationMessages;
  format: (key: ScoreExplanationMessageKey, values?: MessageValues) => string;
  /** Skill and score-source codes come from the API; unknown codes are shown as they are. */
  codeLabel: (prefix: "skill" | "source", code: string) => string;
}

export function useScoreExplanationText(): ScoreExplanationText {
  const { locale } = useLocale();

  return useMemo(() => {
    const messages = locale === "vi" ? SCORE_EXPLANATION_VI : SCORE_EXPLANATION_EN;
    const lookup = messages as Record<string, string | undefined>;
    return {
      locale,
      messages,
      format: (key, values) => formatMessage(messages[key], values),
      codeLabel: (prefix, code) => lookup[`${prefix}${code}`] ?? code,
    };
  }, [locale]);
}
