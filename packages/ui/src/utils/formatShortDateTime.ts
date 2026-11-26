const SEPARATOR = " · ";

/** "16:25 · 26/11/2026": minutes are enough for a record's timestamp, and both portals read it the same way. */
export function formatShortDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  const time = date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", hour12: false });
  const day = date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time}${SEPARATOR}${day}`;
}
