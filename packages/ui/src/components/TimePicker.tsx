"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useAnchoredPanel } from "../hooks/useAnchoredPanel";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";
import { parseTypedTime } from "../utils/timeValue";
import { ClockIcon } from "./dashboardIcons";
import { TimePickerPanel } from "./TimePickerPanel";

const BACKDROP_Z_INDEX = 55;
const PANEL_Z_INDEX = 60;

export interface TimePickerProps {
  /** 24-hour `HH:mm`, or empty. */
  value: string;
  /** Earliest selectable `HH:mm`; earlier choices are disabled in the popup. */
  minTime?: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  variant?: "default" | "table";
}

/** A 24-hour time field: type a time, or open the popup for common times and hour/minute columns. */
export const TimePicker = ({
  value,
  minTime,
  onChange,
  disabled,
  invalid,
  variant = "default",
}: TimePickerProps): ReactElement => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((): void => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  const position = useAnchoredPanel(isOpen, anchorRef, panelRef, close);

  useEffect(() => setDraft(value), [value]);

  const commitDraft = (): void => {
    const text = draft.trim();
    if (!text) {
      if (value) onChange("");
      return;
    }
    const parsed = parseTypedTime(text);
    if (parsed && parsed !== value) onChange(parsed);
    // Anything unreadable falls back to the last good time instead of being kept half-typed.
    if (!parsed) setDraft(value);
  };

  const textSize = variant === "table" ? "text-xs" : "text-sm";

  return (
    <div
      ref={anchorRef}
      className={cn(
        // The tint and divider mark this half as the one being edited, separate from the date.
        "relative -mr-3 flex w-[8.75rem] shrink-0 items-center self-stretch rounded-r-lg border-l border-[var(--divider)] pl-2 pr-3 transition-colors focus-within:bg-[var(--sky-tint)]",
        isOpen && "bg-[var(--sky-tint)]",
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        placeholder={t("common.timePlaceholder", "hh:mm")}
        disabled={disabled}
        aria-label={t("common.selectTime", "Select time")}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          commitDraft();
        }}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent py-2.5 tabular-nums text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)] disabled:cursor-not-allowed disabled:text-[var(--ink-muted)]",
          textSize,
        )}
      />
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={t("common.openTimePicker", "Open time picker")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="shrink-0 rounded-lg p-2 text-[var(--ink-muted)] outline-none hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 disabled:cursor-not-allowed"
      >
        <ClockIcon className="h-4 w-4" />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={close}
              className="fixed inset-0 cursor-default"
              style={{ zIndex: BACKDROP_Z_INDEX }}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-label={t("common.selectTime", "Select time")}
              className="fixed w-[min(18.5rem,calc(100vw-1rem))] rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-3 text-sm shadow-[var(--popover-shadow)] motion-safe:animate-pte-dropdown-in"
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                visibility: position ? "visible" : "hidden",
                zIndex: PANEL_Z_INDEX,
              }}
            >
              <TimePickerPanel
                value={value}
                minTime={minTime}
                labels={{
                  quick: t("common.quickTimes", "Common times"),
                  hour: t("common.hour", "Hour"),
                  minute: t("common.minute", "Minute"),
                  clear: t("common.clear", "Clear"),
                  done: t("common.done", "Done"),
                }}
                onChange={onChange}
                onClear={() => onChange("")}
                onClose={close}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
