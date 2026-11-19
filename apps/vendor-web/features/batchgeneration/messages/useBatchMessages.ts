"use client";

import { useLocale } from "@pte/ui";
import { batchMessages as en, type BatchMessages } from "./en";
import { batchMessages as vi } from "./vi";

/** Batch-generation copy in the active UI language. */
export function useBatchMessages(): BatchMessages {
  const { locale } = useLocale();
  return locale === "vi" ? vi : en;
}
