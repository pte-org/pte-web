/** Helpers for a 24-hour `HH:mm` time value, the shape the date-time pickers store. */

export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const MINUTE_STEP = 5;
/** Times exams most often start or end at; offered as one-click choices. */
export const QUICK_TIMES: readonly string[] = ["08:00", "09:00", "13:30", "17:00"];
/** Hour used when only a minute is chosen first. */
export const DEFAULT_HOUR = 8;

const TIME_PATTERN = /^(\d{1,2})(?:[:.h]?(\d{2}))?h?$/;

const pad = (part: number): string => String(part).padStart(2, "0");

export const formatTime = (hour: number, minute: number): string => `${pad(hour)}:${pad(minute)}`;

/** Splits a stored `HH:mm` value; both parts are null when it is empty or malformed. */
export function splitTime(value: string): { hour: number | null; minute: number | null } {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return { hour: null, minute: null };
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/**
 * Reads what a person typed: `9`, `930`, `9:30`, `09.30` or `9h30`. A bare hour means the top of that hour.
 * Returns null when it is not a time of day.
 */
export function parseTypedTime(text: string): string | null {
  const match = TIME_PATTERN.exec(text.trim().toLowerCase());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2] === undefined ? 0 : Number(match[2]);
  if (hour >= HOURS_PER_DAY || minute >= MINUTES_PER_HOUR) return null;
  return formatTime(hour, minute);
}

export const HOUR_OPTIONS: readonly number[] = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);

/** Minutes on the five-minute grid, plus the current minute when it falls between steps (e.g. 11:44). */
export function minuteOptions(currentMinute: number | null): number[] {
  const grid = Array.from({ length: MINUTES_PER_HOUR / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);
  if (currentMinute === null || grid.includes(currentMinute)) return grid;
  return [...grid, currentMinute].sort((left, right) => left - right);
}

/** True when `time` (`HH:mm`) is earlier than the lower bound; an empty bound allows everything. */
export const isBeforeMinTime = (time: string, minTime: string | undefined): boolean =>
  Boolean(minTime) && time < (minTime ?? "");
