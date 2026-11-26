const COMPLETE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const PAD = 2;

const two = (value: number): string => String(value).padStart(PAD, "0");

/** What is missing from a date-and-time field that is only half filled in; null when it is empty or complete. */
export type AnnouncementDateGap = "TIME_REQUIRED" | "DATE_REQUIRED" | null;

export function announcementDateGap(value: string): AnnouncementDateGap {
  if (!value || COMPLETE.test(value)) return null;
  return DATE_ONLY.test(value) ? "TIME_REQUIRED" : "DATE_REQUIRED";
}

/**
 * A stored instant as the value of a date-and-time field: the wall-clock time of the person's own time zone. Reading it
 * in UTC instead would show another hour than the one they chose and move it again on every save.
 */
export function toLocalValue(instant: string | null): string {
  if (!instant) return "";
  const date = new Date(instant);
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
}

/** The field's local date and time as the instant the server stores; null for an empty or half-filled field. */
export function toIsoValue(value: string): string | null {
  return COMPLETE.test(value) ? new Date(value).toISOString() : null;
}

/**
 * The period an announcement affects must end after it starts, and an end needs a start: the server refuses anything
 * else with a generic "invalid" answer, so the form says it first, next to the field.
 */
export function announcementWindowInvalid(from: string, until: string): boolean {
  if (!until) return false;
  if (!from) return true;
  return new Date(until).getTime() <= new Date(from).getTime();
}
