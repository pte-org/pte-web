const SECONDS_PER_MINUTE = 60;
const EMPTY = "—";

export interface TimeUnits {
  second: string;
  minute: string;
}

/** A length of time for the table: `—` for none, `35 sec`, `10 min` or `1 min 30 sec`, so long limits read at a glance. */
export function formatSeconds(seconds: number, units: TimeUnits): string {
  if (!seconds || seconds <= 0) return EMPTY;
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} ${units.second}`;
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return rest === 0 ? `${minutes} ${units.minute}` : `${minutes} ${units.minute} ${rest} ${units.second}`;
}

/** How many questions the rows can draw in all: the sum of their minimums and of their maximums. */
export function questionRange(items: readonly { minCount: number; maxCount: number }[]): {
  min: number;
  max: number;
} {
  return items.reduce(
    (total, item) => ({ min: total.min + item.minCount, max: total.max + item.maxCount }),
    { min: 0, max: 0 },
  );
}

/** `52–64`, or just `52` when the template always draws the same number. */
export function formatQuestionRange(range: { min: number; max: number }): string {
  return range.min === range.max ? String(range.max) : `${range.min}–${range.max}`;
}
