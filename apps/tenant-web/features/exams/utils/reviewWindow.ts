import { formatExamWindow, type DurationUnits } from "./suggestedExamWindow";

const DATE_LENGTH = 10;
const TIME_START = 11;
const TIME_END = 16;

const displayDate = (value: string): string => {
  const [year, month, day] = value.slice(0, DATE_LENGTH).split("-");
  return `${day}/${month}/${year}`;
};

const displayTime = (value: string): string => value.slice(TIME_START, TIME_END);

/**
 * The open window for the review step, e.g. `26/11/2026 · 09:00 → 15:00 (6 h)`; across days both dates are shown.
 * Empty when either time is missing.
 */
export function formatReviewWindow(opensAt: string, closesAt: string, units: DurationUnits): string {
  if (opensAt.length < TIME_END || closesAt.length < TIME_END) return "";
  const sameDay = opensAt.slice(0, DATE_LENGTH) === closesAt.slice(0, DATE_LENGTH);
  const range = sameDay
    ? `${displayDate(opensAt)} · ${displayTime(opensAt)} → ${displayTime(closesAt)}`
    : `${displayDate(opensAt)} ${displayTime(opensAt)} → ${displayDate(closesAt)} ${displayTime(closesAt)}`;
  const length = formatExamWindow(opensAt, closesAt, units);
  return length ? `${range} (${length})` : range;
}
