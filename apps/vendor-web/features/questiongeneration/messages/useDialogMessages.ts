"use client";

import { useLocale } from "@pte/ui";
import { dialogMessages as en, type DialogMessages } from "./dialog.en";
import { dialogMessages as vi } from "./dialog.vi";

/** Generation-popup copy in the active UI language. */
export function useDialogMessages(): DialogMessages {
  const { locale } = useLocale();
  return locale === "vi" ? vi : en;
}

/** Fills `{name}` placeholders of a catalog string. */
export function formatMessage(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
