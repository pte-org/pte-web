"use client";

import { useLocale } from "@pte/ui";
import { generationMessages as en } from "./en";
import { generationMessages as vi } from "./vi";

/** Question-generation copy in the active UI language (the `en` catalog is the source of truth for the shape). */
export function useGenerationMessages(): Readonly<Record<keyof typeof en, string>> {
  const { locale } = useLocale();
  return locale === "vi" ? vi : en;
}
