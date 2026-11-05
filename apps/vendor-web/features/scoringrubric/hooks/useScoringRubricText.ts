"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import {
  SCORING_RUBRIC_EN,
  type ScoringRubricMessageKey,
  type ScoringRubricMessages,
} from "../messages/en";
import { SCORING_RUBRIC_VI } from "../messages/vi";
import { formatMessage, type MessageValues } from "../rubricView";

export interface ScoringRubricText {
  locale: Locale;
  messages: ScoringRubricMessages;
  format: (key: ScoringRubricMessageKey, values?: MessageValues) => string;
  /** Skill and trait-source codes come from the API; unknown codes are shown as they are. */
  codeLabel: (prefix: "skill" | "source", code: string) => string;
}

export function useScoringRubricText(): ScoringRubricText {
  const { locale } = useLocale();

  return useMemo(() => {
    const messages = locale === "vi" ? SCORING_RUBRIC_VI : SCORING_RUBRIC_EN;
    const lookup = messages as Record<string, string | undefined>;
    return {
      locale,
      messages,
      format: (key, values) => formatMessage(messages[key], values),
      codeLabel: (prefix, code) => lookup[`${prefix}${code}`] ?? code,
    };
  }, [locale]);
}
