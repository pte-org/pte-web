"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "../utils/cn";
import { ChevronDownIcon } from "./icons";
import { FormField } from "./FormField";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectChangeEvent {
  target: { value: string; name?: string };
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (event: SelectChangeEvent) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  "aria-label"?: string;
}

interface ListPosition {
  top: number;
  left: number;
  minWidth: number;
}

const GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;

/**
 * Custom listbox, not a native `<select>` — the browser renders the native popup itself, so its
 * size/colors can't be themed. The list is portaled to `document.body` and positioned with fixed
 * coordinates (same pattern as `Dropdown`) so it can't be clipped by an `overflow-x-auto` ancestor
 * such as a scrollable table wrapper.
 */
export const Select = ({
  id,
  name,
  label,
  error,
  helperText,
  options,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  className,
  title,
  "aria-label": ariaLabel,
}: SelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [listPosition, setListPosition] = useState<ListPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const updateListPosition = (): void => {
      const button = buttonRef.current;
      const list = listRef.current;
      if (!button || !list) return;

      const buttonRect = button.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      const opensAbove =
        buttonRect.bottom + GAP_PX + listRect.height > window.innerHeight &&
        buttonRect.top - GAP_PX - listRect.height >= VIEWPORT_PADDING_PX;
      const top = opensAbove
        ? buttonRect.top - GAP_PX - listRect.height
        : buttonRect.bottom + GAP_PX;
      const maxLeft = Math.max(
        VIEWPORT_PADDING_PX,
        window.innerWidth - listRect.width - VIEWPORT_PADDING_PX,
      );

      setListPosition({
        top: Math.max(
          VIEWPORT_PADDING_PX,
          Math.min(top, window.innerHeight - listRect.height - VIEWPORT_PADDING_PX),
        ),
        left: Math.max(VIEWPORT_PADDING_PX, Math.min(buttonRect.left, maxLeft)),
        minWidth: buttonRect.width,
      });
    };

    updateListPosition();
    window.addEventListener("resize", updateListPosition);
    window.addEventListener("scroll", updateListPosition, true);
    return () => {
      window.removeEventListener("resize", updateListPosition);
      window.removeEventListener("scroll", updateListPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const selectOption = (option: SelectOption): void => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value, name } });
    setIsOpen(false);
  };

  return (
    <FormField id={id} label={label} error={error} helperText={helperText} required={required}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error ? true : undefined}
        onClick={() => {
          setListPosition(null);
          setIsOpen((open) => !open);
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error ? "border-red-500" : "border-gray-300",
          className,
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-gray-400")}>
          {selectedOption?.label ?? placeholder ?? ""}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150",
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
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[55] cursor-default"
            />
            <ul
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel ?? label}
              className="fixed z-[60] max-h-60 max-w-[calc(100vw-1rem)] overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
              style={{
                top: listPosition?.top ?? 0,
                left: listPosition?.left ?? 0,
                minWidth: listPosition?.minWidth,
                visibility: listPosition ? "visible" : "hidden",
              }}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "truncate px-3 py-1.5",
                    option.disabled
                      ? "cursor-not-allowed text-gray-300"
                      : cn(
                          "cursor-pointer",
                          option.value === value
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-blue-50",
                        ),
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </>,
          document.body,
        )}
    </FormField>
  );
};
