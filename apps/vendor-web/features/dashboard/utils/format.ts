import type { Locale } from "@pte/ui";

export type MessageValues = Record<string, string | number | undefined | null>;

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export function formatNumber(value: number, locale: Locale): string {
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(intlLocale).format(value);
}

export function formatPercent(value: number, locale: Locale): string {
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  return `${new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)}%`;
}

export function formatCurrency(amount: number, currency: string, locale: Locale): string {
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${formatNumber(amount, locale)} ${currency}`;
  }
}

export function formatDate(
  instant: string | null | undefined,
  locale: Locale,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  if (!instant) return "—";
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return "—";

  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  try {
    return new Intl.DateTimeFormat(intlLocale, {
      timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString(intlLocale);
  }
}

export function formatMonthLabel(monthKey: string, locale: Locale): string {
  // Format "YYYY-MM" to "MMM yyyy" or "Thg M, YYYY"
  const parts = monthKey.split("-");
  if (parts.length !== 2) return monthKey;
  const year = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) return monthKey;

  const date = new Date(Date.UTC(year, month - 1, 1));
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function formatMessage(template: string, values?: MessageValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const val = values[key];
    return val !== undefined && val !== null ? String(val) : match;
  });
}

export function keyForCount<T extends string>(count: number, singular: T, plural: T): T {
  return count === 1 ? singular : plural;
}
