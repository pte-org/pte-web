import { FAILURE_LABELS } from "../constants";

type Locale = keyof typeof FAILURE_LABELS;

/** A readable reason for a failure code; an unknown code is shown as is so it can still be searched for. */
export function failureLabel(code: string, locale: Locale): string {
  return FAILURE_LABELS[locale][code] ?? code;
}

/** Replaces {name} placeholders in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}
