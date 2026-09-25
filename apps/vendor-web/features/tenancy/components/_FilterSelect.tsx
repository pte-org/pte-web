"use client";

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

/** Custom listbox, not a native `<select>` — the browser renders the native popup itself, so its size/colors can't be themed. */
export const FilterSelect = ({
  ariaLabel,
  value,
  options,
  onChange,
}: FilterSelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const selectOption = (nextValue: string): void => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
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
      {isOpen && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => selectOption(option.value)}
              className={cn(
                "cursor-pointer px-3 py-1.5",
                option.value === value
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-50",
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
