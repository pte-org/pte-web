const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 hours ago" / "3 giờ trước": how long ago an ISO time was, in the given language. */
export function formatRelativeTime(iso: string, now: Date, locale: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSeconds = Math.round((then - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) return formatter.format(Math.trunc(diffSeconds / seconds), unit);
  }
  return formatter.format(0, "second");
}
