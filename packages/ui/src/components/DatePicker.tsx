"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactElement,
} from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";
import { FormField } from "./FormField";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { NextAdminCalendarIcon } from "./nextAdminIcons";

const GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const DATE_PICKER_BACKDROP_Z_INDEX = 55;
const DATE_PICKER_PANEL_Z_INDEX = 60;
const CALENDAR_CELL_COUNT = 42;
const MONTH_COUNT = 12;
const YEAR_PAGE_SIZE = 12;

type DatePickerView = "days" | "months" | "years";

interface PanelPosition {
  top: number;
  left: number;
}

export interface DatePickerChangeEvent {
  target: {
    value: string;
    name?: string;
  };
}

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "className"
> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (event: DatePickerChangeEvent) => void;
  className?: string;
  includeTime?: boolean;
  variant?: "default" | "table";
}

function parseDate(value: string | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.slice(0, 10) ?? "");
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : null;
}

function formatIsoDate(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) =>
      index === 0 ? String(part).padStart(4, "0") : String(part).padStart(2, "0"),
    )
    .join("-");
}

function formatDisplayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function isSameDay(left: Date | null, right: Date): boolean {
  return Boolean(
    left &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate(),
  );
}

function startOfCalendarMonth(date: Date): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), 1 - mondayOffset);
}

function dateFromValue(value: string | number | undefined): Date | null {
  return typeof value === "string" ? parseDate(value) : null;
}

function dateIsBefore(left: Date, right: Date): boolean {
  return formatIsoDate(left) < formatIsoDate(right);
}

function dateIsAfter(left: Date, right: Date): boolean {
  return formatIsoDate(left) > formatIsoDate(right);
}

function dispatchChange(
  onChange: DatePickerProps["onChange"],
  value: string,
  name: string | undefined,
): void {
  onChange?.({ target: { value, name } });
}

export const DatePicker = ({
  id,
  name,
  label,
  error,
  helperText,
  value = "",
  onChange,
  className,
  placeholder,
  required,
  disabled,
  readOnly,
  min,
  max,
  includeTime = false,
  variant = "default",
  "aria-label": ariaLabel,
}: DatePickerProps): ReactElement => {
  const { locale, t } = useLocale();
  const localeTag = locale === "vi" ? "vi-VN" : "en-US";
  const dateValue = value.slice(0, 10);
  const timeValue = value.length > 10 ? value.slice(11, 16) : "";
  const selectedDate = dateFromValue(dateValue);
  const minDate = dateFromValue(min);
  const maxDate = dateFromValue(max);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date());
  const [view, setView] = useState<DatePickerView>("days");
  const [yearPageStart, setYearPageStart] = useState(() => {
    const year = (selectedDate ?? new Date()).getFullYear();
    return Math.floor(year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;
  });
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controlId = id ?? name?.toString() ?? label?.toLowerCase().replace(/\s+/g, "-");
  const resolvedPlaceholder = placeholder ?? t("common.datePlaceholder", "dd/mm/yyyy");
  const resolvedAriaLabel = ariaLabel ?? label ?? t("common.selectDate", "Select date");

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        month: "long",
        year: "numeric",
      }).format(viewDate),
    [localeTag, viewDate],
  );
  const weekdayLabels = useMemo(() => {
    const monday = new Date(2026, 0, 5);
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(localeTag, { weekday: "short" }).format(
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index),
      ),
    );
  }, [localeTag]);
  const monthLabels = useMemo(
    () =>
      Array.from({ length: MONTH_COUNT }, (_, month) =>
        new Intl.DateTimeFormat(localeTag, { month: "short" }).format(new Date(2026, month, 1)),
      ),
    [localeTag],
  );
  const calendarDays = useMemo(() => {
    const firstDay = startOfCalendarMonth(viewDate);
    return Array.from(
      { length: CALENDAR_CELL_COUNT },
      (_, index) =>
        new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index),
    );
  }, [viewDate]);
  const yearLabels = useMemo(
    () => Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearPageStart + index),
    [yearPageStart],
  );

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelPosition = (): void => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const opensAbove =
        triggerRect.bottom + GAP_PX + panelRect.height > window.innerHeight &&
        triggerRect.top - GAP_PX - panelRect.height >= VIEWPORT_PADDING_PX;
      const top = opensAbove
        ? triggerRect.top - GAP_PX - panelRect.height
        : triggerRect.bottom + GAP_PX;
      const maxLeft = Math.max(
        VIEWPORT_PADDING_PX,
        window.innerWidth - panelRect.width - VIEWPORT_PADDING_PX,
      );

      setPanelPosition({
        top: Math.max(
          VIEWPORT_PADDING_PX,
          Math.min(top, window.innerHeight - panelRect.height - VIEWPORT_PADDING_PX),
        ),
        left: Math.max(VIEWPORT_PADDING_PX, Math.min(triggerRect.left, maxLeft)),
      });
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, view]);

  useEffect(() => {
    if (!isOpen) return;
    const nextViewDate = selectedDate ?? new Date();
    setViewDate(nextViewDate);
    setYearPageStart(Math.floor(nextViewDate.getFullYear() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE);
    setView("days");
  }, [dateValue, isOpen]);

  const closePicker = (): void => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const emitDate = (nextDate: string): void => {
    dispatchChange(
      onChange,
      includeTime && timeValue ? `${nextDate}T${timeValue}` : nextDate,
      name,
    );
    closePicker();
  };

  const emitTime = (nextTime: string): void => {
    if (!nextTime) {
      dispatchChange(onChange, dateValue, name);
      return;
    }

    dispatchChange(onChange, dateValue ? `${dateValue}T${nextTime}` : `T${nextTime}`, name);
  };

  const dateIsDisabled = (date: Date): boolean =>
    Boolean((minDate && dateIsBefore(date, minDate)) || (maxDate && dateIsAfter(date, maxDate)));

  const openPicker = (): void => {
    if (disabled || readOnly) return;
    setPanelPosition(null);
    setIsOpen(true);
  };

  const moveView = (amount: number): void => {
    if (view === "days") {
      setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
      return;
    }
    if (view === "months") {
      setViewDate((current) => new Date(current.getFullYear() + amount, current.getMonth(), 1));
      return;
    }
    setYearPageStart((current) => current + amount * YEAR_PAGE_SIZE);
  };

  const selectMonth = (month: number): void => {
    setViewDate((current) => new Date(current.getFullYear(), month, 1));
    setView("days");
  };

  const selectYear = (year: number): void => {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setView("months");
  };

  const displayValue = selectedDate
    ? formatDisplayDate(dateValue)
    : dateValue || resolvedPlaceholder;
  const displayTime = includeTime ? timeValue : "";

  return (
    <FormField
      id={controlId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      <div className="relative">
        {name && <input type="hidden" name={name} value={value} readOnly />}
        <div
          className={cn(
            "flex items-center border transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20",
            variant === "table"
              ? "min-h-9 rounded-md bg-[var(--table-control-background)]"
              : "min-h-10 rounded-lg bg-[var(--surface-card)]",
            error
              ? "border-[var(--blush-action)]"
              : variant === "table"
                ? "border-[var(--table-control-border)]"
                : "border-[var(--control-border)]",
            disabled &&
              (variant === "table"
                ? "cursor-not-allowed bg-[var(--table-control-background)]"
                : "cursor-not-allowed bg-[var(--surface-subtle)]"),
            includeTime ? "gap-2 px-3" : "px-0",
          )}
        >
          <button
            ref={triggerRef}
            id={controlId}
            type="button"
            disabled={disabled}
            aria-label={resolvedAriaLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-required={required || undefined}
            aria-readonly={readOnly || undefined}
            aria-invalid={error ? true : undefined}
            onClick={() => (isOpen ? closePicker() : openPicker())}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between gap-2 text-left outline-none disabled:cursor-not-allowed",
              variant === "table"
                ? "rounded-md px-2 py-1.5 text-xs text-[var(--table-body-text)]"
                : "rounded-lg px-3 py-2.5 text-sm text-[var(--ink-primary)]",
              !selectedDate &&
                (variant === "table"
                  ? "text-[var(--table-muted-text)]"
                  : "text-[var(--ink-muted)]"),
              includeTime && "px-0",
              className,
            )}
          >
            <span className="truncate">{displayValue}</span>
            <NextAdminCalendarIcon className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
          </button>
          {includeTime && (
            <input
              type="time"
              aria-label={t("common.selectTime", "Select time")}
              value={displayTime}
              disabled={disabled || readOnly || !dateValue}
              onChange={(event) => emitTime(event.target.value)}
              className={cn(
                "w-[5.25rem] shrink-0 border-0 bg-transparent tabular-nums outline-none disabled:cursor-not-allowed",
                variant === "table"
                  ? "py-1.5 text-xs text-[var(--table-body-text)] disabled:text-[var(--table-muted-text)]"
                  : "py-2.5 text-sm text-[var(--ink-primary)] disabled:text-[var(--ink-muted)]",
              )}
            />
          )}
        </div>

        {isOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={closePicker}
                className="fixed inset-0 cursor-default"
                style={{ zIndex: DATE_PICKER_BACKDROP_Z_INDEX }}
              />
              <div
                ref={panelRef}
                role="dialog"
                aria-label={resolvedAriaLabel}
                className={cn(
                  "fixed w-[min(22rem,calc(100vw-1rem))] p-3 text-sm shadow-[var(--popover-shadow)] motion-safe:animate-pte-dropdown-in",
                  variant === "table"
                    ? "rounded-lg border border-[var(--table-border)] bg-[var(--table-surface-background)]"
                    : "rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]",
                )}
                style={{
                  top: panelPosition?.top ?? 0,
                  left: panelPosition?.left ?? 0,
                  visibility: panelPosition ? "visible" : "hidden",
                  zIndex: DATE_PICKER_PANEL_Z_INDEX,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label={t("common.previousMonth", "Previous month")}
                    onClick={() => moveView(-1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ink-secondary)] outline-none hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setView((current) =>
                        current === "days" ? "months" : current === "months" ? "years" : "days",
                      )
                    }
                    className="min-w-0 truncate rounded-lg px-2 py-2 font-medium text-[var(--ink-primary)] outline-none hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                  >
                    {view === "days"
                      ? monthLabel
                      : view === "months"
                        ? String(viewDate.getFullYear())
                        : `${yearPageStart}–${yearPageStart + YEAR_PAGE_SIZE - 1}`}
                  </button>
                  <button
                    type="button"
                    aria-label={t("common.nextMonth", "Next month")}
                    onClick={() => moveView(1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ink-secondary)] outline-none hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 min-h-[18rem]">
                  {view === "days" && (
                    <>
                      <div className="grid grid-cols-7 text-center text-xs font-medium text-[var(--ink-muted)]">
                        {weekdayLabels.map((weekday) => (
                          <span key={weekday} className="py-2">
                            {weekday}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((date) => {
                          const isoDate = formatIsoDate(date);
                          const isSelected = isSameDay(selectedDate, date);
                          const isToday = isSameDay(new Date(), date);
                          const isOutsideMonth = date.getMonth() !== viewDate.getMonth();
                          const isDisabled = dateIsDisabled(date);

                          return (
                            <button
                              key={isoDate}
                              type="button"
                              aria-label={new Intl.DateTimeFormat(localeTag, {
                                dateStyle: "long",
                              }).format(date)}
                              aria-current={isToday ? "date" : undefined}
                              aria-pressed={isSelected}
                              disabled={isDisabled}
                              onClick={() => emitDate(isoDate)}
                              className={cn(
                                "relative mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                                isSelected
                                  ? "bg-[var(--action)] text-[var(--action-foreground)] hover:bg-[var(--action)]"
                                  : isDisabled
                                    ? "cursor-not-allowed text-[var(--ink-muted)] opacity-50"
                                    : "text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]",
                                isOutsideMonth && !isSelected && "text-[var(--ink-muted)]",
                              )}
                            >
                              {date.getDate()}
                              {isToday && (
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "absolute bottom-1 h-1 w-1 rounded-full",
                                    isSelected
                                      ? "bg-[var(--action-foreground)]"
                                      : "bg-[var(--action)]",
                                  )}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {view === "months" && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {monthLabels.map((month, index) => {
                        const isSelected = index === viewDate.getMonth();
                        return (
                          <button
                            key={`${month}-${index}`}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectMonth(index)}
                            className={cn(
                              "h-10 rounded-lg px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                              isSelected
                                ? "bg-[var(--action)] font-medium text-[var(--action-foreground)]"
                                : "text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]",
                            )}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {view === "years" && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {yearLabels.map((year) => {
                        const isSelected = year === viewDate.getFullYear();
                        return (
                          <button
                            key={year}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectYear(year)}
                            className={cn(
                              "h-10 rounded-lg px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                              isSelected
                                ? "bg-[var(--action)] font-medium text-[var(--action-foreground)]"
                                : "text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]",
                            )}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-2">
                  <p className="text-xs text-[var(--ink-muted)]">
                    {selectedDate
                      ? formatDisplayDate(dateValue)
                      : t("common.selectDate", "Select a date")}
                  </p>
                  <button
                    type="button"
                    disabled={!value}
                    onClick={() => {
                      dispatchChange(onChange, "", name);
                      closePicker();
                    }}
                    className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--action)] outline-none hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 disabled:cursor-not-allowed disabled:text-[var(--ink-muted)]"
                  >
                    {t("common.clear", "Clear")}
                  </button>
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>
    </FormField>
  );
};

export const DateTimePicker = (props: Omit<DatePickerProps, "includeTime">): ReactElement => (
  <DatePicker {...props} includeTime />
);
