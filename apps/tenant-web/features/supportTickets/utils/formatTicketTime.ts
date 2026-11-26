const TIME_SEPARATOR = " · ";

/** "16:25 · 26/11/2026": minutes are enough for a ticket, and it reads the same as the exam template pages. */
export function formatTicketTime(iso: string, locale: string): string {
  const date = new Date(iso);
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  const time = date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", hour12: false });
  const day = date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time}${TIME_SEPARATOR}${day}`;
}
