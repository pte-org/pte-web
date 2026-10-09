"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ChangeEvent, type ReactElement } from "react";
import { cn } from "../utils/cn";
import { ChevronDownIcon } from "./icons";
import { useLocale } from "../i18n";

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  ariaLabel: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "table";
  fromLabel?: string;
  toLabel?: string;
  clearLabel?: string;
}

interface PanelPosition {
  top: number;
  left: number;
}

const GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const BACKDROP_Z_INDEX = 55;
const PANEL_Z_INDEX = 60;

function formatDisplayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export const DateRangePicker = ({
  ariaLabel,
  value,
  onChange,
  placeholder,
  className,
  variant = "default",
  fromLabel,
  toLabel,
  clearLabel,
}: DateRangePickerProps): ReactElement => {
  const { t } = useLocale();
  const resolvedPlaceholder = placeholder ?? t("common.dateRange", "Date range");
  const resolvedFromLabel = fromLabel ?? t("common.from", "From");
  const resolvedToLabel = toLabel ?? t("common.until", "Until");
  const resolvedClearLabel = clearLabel ?? t("common.clear", "Clear");
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasValue = Boolean(value.from || value.to);
  const isInvalid = Boolean(value.from && value.to && value.from > value.to);
  const isTable = variant === "table";

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelPosition = (): void => {
      const button = buttonRef.current;
      const panel = panelRef.current;
      if (!button || !panel) return;

      const buttonRect = button.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const opensAbove =
        buttonRect.bottom + GAP_PX + panelRect.height > window.innerHeight &&
        buttonRect.top - GAP_PX - panelRect.height >= VIEWPORT_PADDING_PX;
      const top = opensAbove
        ? buttonRect.top - GAP_PX - panelRect.height
        : buttonRect.bottom + GAP_PX;
      const maxLeft = Math.max(
        VIEWPORT_PADDING_PX,
        window.innerWidth - panelRect.width - VIEWPORT_PADDING_PX,
      );

      setPanelPosition({
        top: Math.max(
          VIEWPORT_PADDING_PX,
          Math.min(top, window.innerHeight - panelRect.height - VIEWPORT_PADDING_PX),
        ),
        left: Math.max(VIEWPORT_PADDING_PX, Math.min(buttonRect.left, maxLeft)),
      });
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
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
  }, [isOpen]);

  const updateRange =
    (key: keyof DateRangeValue) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange({ ...value, [key]: event.target.value });
    };

  const triggerLabel =
    value.from && value.to
      ? `${formatDisplayDate(value.from)} – ${formatDisplayDate(value.to)}`
      : value.from
        ? `${resolvedFromLabel} ${formatDisplayDate(value.from)}`
        : value.to
          ? `${resolvedToLabel} ${formatDisplayDate(value.to)}`
          : resolvedPlaceholder;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={isInvalid || undefined}
        onClick={() => {
          setPanelPosition(null);
          setIsOpen((current) => !current);
        }}
        className={cn(
          "flex w-full min-w-[170px] items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm outline-none transition-[background-color,border-color,box-shadow] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20",
          isTable ? "h-8" : "h-9",
          isTable
            ? "border-[var(--table-control-border)] bg-[var(--table-control-background)]"
            : "border-[var(--control-border)] bg-[var(--surface-card)]",
          isInvalid && "border-[var(--blush-action)]",
          !hasValue && (isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-muted)]"),
          className,
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-150",
            isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-muted)]",
            isOpen && "-rotate-180",
          )}
        />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => {
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              className="fixed inset-0 cursor-default"
              style={{ zIndex: BACKDROP_Z_INDEX }}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              className={cn(
                "fixed w-[min(22rem,calc(100vw-1rem))] rounded-lg border p-3 text-sm shadow-[var(--popover-shadow)] motion-safe:animate-pte-dropdown-in",
                isTable
                  ? "border-[var(--table-border)] bg-[var(--table-surface-background)]"
                  : "border-[var(--shell-border)] bg-[var(--surface-card)]",
              )}
              style={{
                top: panelPosition?.top ?? 0,
                left: panelPosition?.left ?? 0,
                visibility: panelPosition ? "visible" : "hidden",
                zIndex: PANEL_Z_INDEX,
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "flex min-w-0 flex-col gap-1.5 text-xs font-medium",
                    isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-secondary)]",
                  )}
                >
                  <span>{resolvedFromLabel}</span>
                  <input
                    type="date"
                    aria-label={`${ariaLabel} ${resolvedFromLabel}`}
                    value={value.from}
                    max={value.to || undefined}
                    onChange={updateRange("from")}
                    className={cn(
                      "h-9 min-w-0 rounded-md border px-2 text-sm font-normal outline-none transition-[border-color,box-shadow] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20",
                      isTable
                        ? "border-[var(--table-control-border)] bg-[var(--table-control-background)] text-[var(--table-body-text)]"
                        : "border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)]",
                    )}
                  />
                </label>
                <label
                  className={cn(
                    "flex min-w-0 flex-col gap-1.5 text-xs font-medium",
                    isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-secondary)]",
                  )}
                >
                  <span>{resolvedToLabel}</span>
                  <input
                    type="date"
                    aria-label={`${ariaLabel} ${resolvedToLabel}`}
                    value={value.to}
                    min={value.from || undefined}
                    onChange={updateRange("to")}
                    className={cn(
                      "h-9 min-w-0 rounded-md border px-2 text-sm font-normal outline-none transition-[border-color,box-shadow] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20",
                      isTable
                        ? "border-[var(--table-control-border)] bg-[var(--table-control-background)] text-[var(--table-body-text)]"
                        : "border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)]",
                    )}
                  />
                </label>
              </div>
              <div
                className={cn(
                  "mt-3 flex items-center justify-between gap-3 border-t pt-3",
                  isTable ? "border-[var(--table-border)]" : "border-[var(--divider)]",
                )}
              >
                <p
                  className={cn(
                    "text-xs",
                    isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-muted)]",
                    isInvalid && "text-[var(--blush-action)]",
                  )}
                  role={isInvalid ? "alert" : undefined}
                >
                  {isInvalid
                    ? t("common.dateFromToInvalid", "From date must be on or before to date.")
                    : t("common.filterDateRange", "Filter by a date range")}
                </p>
                <button
                  type="button"
                  disabled={!hasValue}
                  onClick={() => onChange({ from: "", to: "" })}
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--action)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 disabled:cursor-not-allowed",
                    isTable
                      ? "hover:bg-[var(--table-control-hover)] disabled:text-[var(--table-muted-text)]"
                      : "hover:bg-[var(--surface-subtle)] disabled:text-[var(--ink-muted)]",
                  )}
                >
                  {resolvedClearLabel}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
