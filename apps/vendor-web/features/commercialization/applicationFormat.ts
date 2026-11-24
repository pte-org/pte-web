const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;
const HOURS_PER_DAY = 24;

/** The locale tag used for dates and numbers on admin screens. */
export const dateLocaleTag = (locale: string): string => (locale === "vi" ? "vi-VN" : "en-GB");

export const formatDateTime = (value: string, locale: string): string =>
  new Date(value).toLocaleString(dateLocaleTag(locale));

/** "5 minutes ago" / "2 hours ago" / "3 days ago" in the reader's language, counted from {@code nowMs}. */
export const formatElapsed = (value: string, locale: string, nowMs: number): string => {
  const elapsedMs = Math.max(0, nowMs - new Date(value).getTime());
  const hours = Math.floor(elapsedMs / MS_PER_HOUR);
  const formatter = new Intl.RelativeTimeFormat(dateLocaleTag(locale), { numeric: "auto" });
  if (hours >= HOURS_PER_DAY * 2)
    return formatter.format(-Math.floor(hours / HOURS_PER_DAY), "day");
  if (hours >= 1) return formatter.format(-hours, "hour");
  return formatter.format(-Math.floor(elapsedMs / MS_PER_MINUTE), "minute");
};

export const formatHours = (hours: number, locale: string): string =>
  new Intl.NumberFormat(dateLocaleTag(locale), {
    style: "unit",
    unit: "hour",
    unitDisplay: "long",
  }).format(hours);

/** Whole hours left until {@code dueAt}; negative once the deadline has passed. */
export const hoursUntil = (dueAt: string, nowMs: number): number =>
  Math.floor((new Date(dueAt).getTime() - nowMs) / MS_PER_HOUR);
