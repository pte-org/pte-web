"use client";

import type { ReactElement } from "react";
import { DashboardCard } from "./DashboardCard";
import { DateRangePicker, type DateRangeValue } from "./DateRangePicker";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

/** A one-click range shown as a chip next to the picker. */
export interface DateRangePreset extends DateRangeValue {
  key: string;
  label: string;
}

/** yyyy-MM-dd of an instant on the calendar of `timeZone`. */
export function calendarDate(instant: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(instant);
}

/** The last `days` days, today included, on the calendar of `timeZone`. */
export function lastDaysRange(now: Date, days: number, timeZone: string = DEFAULT_TIME_ZONE): DateRangeValue {
  return {
    from: calendarDate(new Date(now.getTime() - (days - 1) * MS_PER_DAY), timeZone),
    to: calendarDate(now, timeZone),
  };
}

/** The usual report chips: last 7 days, last 30 days and the month so far. */
export function standardDateRangePresets(
  now: Date,
  labels: { last7: string; last30: string; thisMonth: string },
  timeZone: string = DEFAULT_TIME_ZONE,
): DateRangePreset[] {
  const today = calendarDate(now, timeZone);
  return [
    { key: "last7", label: labels.last7, ...lastDaysRange(now, 7, timeZone) },
    { key: "last30", label: labels.last30, ...lastDaysRange(now, 30, timeZone) },
    { key: "thisMonth", label: labels.thisMonth, from: `${today.slice(0, 7)}-01`, to: today },
  ];
}

const chipClass = (selected: boolean): string =>
  `rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
    selected
      ? "border-[var(--action)] bg-[var(--action)] text-white"
      : "border-[var(--shell-border)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
  }`;

export interface DateRangeFilterProps {
  id: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  presets: readonly DateRangePreset[];
  /** Read out for the picker. */
  ariaLabel: string;
  /** Shown in the picker when no range is set; also names the group of chips. */
  placeholder: string;
}

/** A report's date filter in a card: a range picker followed by one-click chips such as "7 days". */
export const DateRangeFilter = ({
  id,
  value,
  onChange,
  presets,
  ariaLabel,
  placeholder,
}: DateRangeFilterProps): ReactElement => (
  <DashboardCard>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:w-auto sm:min-w-[220px]">
        <DateRangePicker id={id} ariaLabel={ariaLabel} value={value} onChange={onChange} placeholder={placeholder} />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={placeholder}>
        {presets.map((preset) => {
          const selected = preset.from === value.from && preset.to === value.to;
          return (
            <button
              key={preset.key}
              type="button"
              className={chipClass(selected)}
              aria-pressed={selected}
              onClick={() => onChange({ from: preset.from, to: preset.to })}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  </DashboardCard>
);
