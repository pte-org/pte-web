import type { Locale } from "@pte/ui";
import { PERCENT_SCALE } from "../constants";
import type { HostDashboardMessageKey } from "../messages/en";

const LOCALE_TAGS: Record<Locale, string> = { vi: "vi-VN", en: "en-US" };
const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;
const UTC_ZONE = "UTC";
const MAX_PERCENT_FRACTION_DIGITS = 1;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const SINGULAR_COUNT = 1;

export type MessageValues = Readonly<Record<string, string | number>>;

/** Fills `{name}` placeholders; a placeholder without a value is left untouched. */
export function formatMessage(template: string, values?: MessageValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}

/**
 * Picks the singular catalog key for exactly one, otherwise the plural one. Vietnamese has no
 * plural, so its singular and plural entries carry the same wording.
 */
export function keyForCount(
  count: number,
  singular: HostDashboardMessageKey,
  plural: HostDashboardMessageKey,
): HostDashboardMessageKey {
  return count === SINGULAR_COUNT ? singular : plural;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale]).format(value);
}

/** `changePct` is expressed in percent points (12.5 means +12.5%). */
export function formatSignedPercent(changePct: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "percent",
    signDisplay: "exceptZero",
    maximumFractionDigits: MAX_PERCENT_FRACTION_DIGITS,
  }).format(changePct / PERCENT_SCALE);
}

export function formatPercent(percent: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percent / PERCENT_SCALE);
}

function formatterFor(
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { ...options, timeZone });
  } catch {
    // An unknown zone name from the server must not break the page: fall back to the browser zone.
    return new Intl.DateTimeFormat(LOCALE_TAGS[locale], options);
  }
}

/** Empty string when the value is not a valid ISO instant; callers show a dash. */
export function formatDateTime(iso: string, locale: Locale, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatterFor(locale, { dateStyle: "medium", timeStyle: "short" }, timeZone).format(date);
}

export function formatDate(iso: string, locale: Locale, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatterFor(locale, { dateStyle: "medium" }, timeZone).format(date);
}

/** `yyyy-MM` to a short month and year such as "Oct 2026"; the input is returned if malformed. */
export function formatMonthLabel(month: string, locale: Locale): string {
  const match = MONTH_KEY_PATTERN.exec(month);
  if (!match || Number(match[2]) < MIN_MONTH || Number(match[2]) > MAX_MONTH) return month;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return formatterFor(locale, { month: "short", year: "numeric" }, UTC_ZONE).format(date);
}
