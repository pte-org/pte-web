"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChevronDownIcon, cn } from "@pte/ui";

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  ariaLabel: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
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
 * coordinates so it can't be clipped by the table's `overflow-x-auto` wrapper.
 */
export const FilterSelect = ({
  ariaLabel,
  value,
  options,
  onChange,
}: FilterSelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [listPosition, setListPosition] = useState<ListPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

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

  const selectOption = (nextValue: string): void => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setListPosition(null);
          setIsOpen((open) => !open);
        }}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2.5 text-left text-sm text-gray-700 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        <span className="truncate">{selectedOption?.label}</span>
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
              className="fixed inset-0 z-10 cursor-default"
            />
            <ul
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel}
              className="fixed z-20 max-h-60 max-w-[calc(100vw-1rem)] overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
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
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    "cursor-pointer truncate px-3 py-1.5",
                    option.value === value
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50",
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </>,
          document.body,
        )}
    </div>
  );
};
