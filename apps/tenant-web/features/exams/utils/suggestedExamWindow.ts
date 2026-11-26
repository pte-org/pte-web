/** How long a new exam stays open when the host has not chosen a close time. */
export const DEFAULT_EXAM_WINDOW_HOURS = 3;
const DATE_TIME_PREFIX_LENGTH = 16;

const pad = (part: number): string => String(part).padStart(2, "0");

/** `yyyy-mm-ddThh:mm` in local time, the value the date-time picker stores. */
export function formatLocalDateTime(date: Date): string {
  const day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Opens at the next full hour and closes {@link DEFAULT_EXAM_WINDOW_HOURS} later, so both start in the future. */
export function suggestExamWindow(now: Date = new Date()): { opensAt: string; closesAt: string } {
  const opens = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
  const closes = new Date(opens.getTime());
  closes.setHours(closes.getHours() + DEFAULT_EXAM_WINDOW_HOURS);
  return { opensAt: formatLocalDateTime(opens), closesAt: formatLocalDateTime(closes) };
}

/** True only when both values carry a time and the close is not after the open (a bare date is still being picked). */
export function closesBeforeOpens(opensAt: string, closesAt: string): boolean {
  if (opensAt.length < DATE_TIME_PREFIX_LENGTH || closesAt.length < DATE_TIME_PREFIX_LENGTH) return false;
  return new Date(closesAt).getTime() <= new Date(opensAt).getTime();
}

/** The close time to use after the open time moved: unchanged unless it would now fall at or before the open. */
export function closeAfterOpenChange(nextOpensAt: string, closesAt: string): string {
  if (nextOpensAt.length < DATE_TIME_PREFIX_LENGTH || !closesBeforeOpens(nextOpensAt, closesAt)) return closesAt;
  const closes = new Date(nextOpensAt);
  closes.setHours(closes.getHours() + DEFAULT_EXAM_WINDOW_HOURS);
  return formatLocalDateTime(closes);
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MS_PER_MINUTE = 60_000;

export interface DurationUnits {
  day: string;
  hour: string;
  minute: string;
}

/** The length between open and close as `1 day 2 h 30 min`, or null while either time is missing or the order is wrong. */
export function formatExamWindow(opensAt: string, closesAt: string, units: DurationUnits): string | null {
  if (opensAt.length < DATE_TIME_PREFIX_LENGTH || closesAt.length < DATE_TIME_PREFIX_LENGTH) return null;
  const minutes = Math.round((new Date(closesAt).getTime() - new Date(opensAt).getTime()) / MS_PER_MINUTE);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const days = Math.floor(minutes / MINUTES_PER_DAY);
  const hours = Math.floor((minutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  return [
    days > 0 ? `${days} ${units.day}` : "",
    hours > 0 ? `${hours} ${units.hour}` : "",
    rest > 0 ? `${rest} ${units.minute}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** The browser's offset from UTC, e.g. `GMT+7`, so the host can see which clock the times are on. */
export function localTimeZoneLabel(now: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(now)
    .find((item) => item.type === "timeZoneName");
  return part?.value ?? "";
}
