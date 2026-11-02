/** A template's audit time as "3 Nov 2026, 14:05"; a dash when the server sent none. */
export const formatTemplateTimestamp = (
  instant: string | null | undefined,
  locale: string,
): string => {
  if (!instant) return "—";
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
