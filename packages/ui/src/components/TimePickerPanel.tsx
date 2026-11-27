"use client";

import { useEffect, useRef, type ReactElement } from "react";
import {
  DEFAULT_HOUR,
  HOUR_OPTIONS,
  QUICK_TIMES,
  formatTime,
  isBeforeMinTime,
  minuteOptions,
  splitTime,
} from "../utils/timeValue";
import { cn } from "../utils/cn";

const MAX_MINUTE = 59;
const FOCUS_RING = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35";

export interface TimePickerPanelLabels {
  quick: string;
  hour: string;
  minute: string;
  clear: string;
  done: string;
}

interface TimePickerPanelProps {
  value: string;
  /** Earliest selectable `HH:mm`; earlier choices are shown but disabled. */
  minTime?: string;
  labels: TimePickerPanelLabels;
  onChange: (next: string) => void;
  onClear: () => void;
  onClose: () => void;
}

interface TimeColumnProps {
  label: string;
  options: readonly number[];
  selected: number | null;
  isDisabled: (option: number) => boolean;
  onSelect: (option: number) => void;
  className?: string;
}

const optionLabel = (option: number): string => String(option).padStart(2, "0");

const TimeColumn = ({
  label,
  options,
  selected,
  isDisabled,
  onSelect,
  className,
}: TimeColumnProps): ReactElement => {
  const columnRef = useRef<HTMLDivElement>(null);

  // Open on the chosen value instead of at 00, so the current time is visible without scrolling.
  useEffect(() => {
    const column = columnRef.current;
    const active = column?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!column || !active) return;
    column.scrollTop = active.offsetTop - column.clientHeight / 2 + active.clientHeight / 2;
  }, []);

  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-1 text-center text-xs font-medium text-[var(--ink-muted)]">{label}</p>
      <div
        ref={columnRef}
        role="group"
        aria-label={label}
        className="relative flex max-h-48 flex-col gap-1 overflow-y-auto p-1 [scrollbar-color:var(--control-border)_transparent] [scrollbar-width:thin]"
      >
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled(option)}
              onClick={() => onSelect(option)}
              className={cn(
                "h-8 shrink-0 rounded-md text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                FOCUS_RING,
                isSelected
                  ? "bg-[var(--action)] font-semibold text-[var(--action-foreground)]"
                  : "text-[var(--ink-primary)] enabled:hover:bg-[var(--surface-subtle)]",
              )}
            >
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Body of the time popup: one-click common times, then hour and minute columns on a 24-hour clock. */
export const TimePickerPanel = ({
  value,
  minTime,
  labels,
  onChange,
  onClear,
  onClose,
}: TimePickerPanelProps): ReactElement => {
  const { hour, minute } = splitTime(value);
  // Choosing the earliest allowed hour must not leave a minute that is already too early.
  const choose = (next: string): void => onChange(isBeforeMinTime(next, minTime) ? (minTime ?? next) : next);

  return (
    <>
      <p className="text-xs font-medium text-[var(--ink-muted)]">{labels.quick}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 border-b border-[var(--divider)] pb-3">
        {QUICK_TIMES.map((quickTime) => (
          <button
            key={quickTime}
            type="button"
            aria-pressed={quickTime === value}
            disabled={isBeforeMinTime(quickTime, minTime)}
            onClick={() => {
              onChange(quickTime);
              onClose();
            }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35",
              FOCUS_RING,
              quickTime === value
                ? "border-[var(--action)] bg-[var(--action)] text-[var(--action-foreground)]"
                : "border-[var(--control-border)] text-[var(--ink-primary)] enabled:hover:bg-[var(--surface-subtle)]",
            )}
          >
            {quickTime}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 py-3">
        <TimeColumn
          label={labels.hour}
          options={HOUR_OPTIONS}
          selected={hour}
          className="pr-2"
          isDisabled={(option) => isBeforeMinTime(formatTime(option, MAX_MINUTE), minTime)}
          onSelect={(next) => choose(formatTime(next, minute ?? 0))}
        />
        <TimeColumn
          label={labels.minute}
          options={minuteOptions(minute)}
          selected={minute}
          className="border-l border-[var(--divider)] pl-2"
          isDisabled={(option) => isBeforeMinTime(formatTime(hour ?? DEFAULT_HOUR, option), minTime)}
          onSelect={(next) => choose(formatTime(hour ?? DEFAULT_HOUR, next))}
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-2">
        <button
          type="button"
          disabled={!value}
          onClick={() => {
            onClear();
            onClose();
          }}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] disabled:cursor-not-allowed disabled:opacity-40",
            FOCUS_RING,
          )}
        >
          {labels.clear}
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "rounded-md bg-[var(--action)] px-3 py-1.5 text-xs font-semibold text-[var(--action-foreground)] hover:opacity-90",
            FOCUS_RING,
          )}
        >
          {labels.done}
        </button>
      </div>
    </>
  );
};
