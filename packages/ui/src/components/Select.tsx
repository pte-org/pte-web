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

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  helperText?: string;
  options: readonly SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (event: SelectChangeEvent) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}

interface ListPosition {
  top: number;
  left: number;
  minWidth: number;
}

const GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const SELECT_BACKDROP_Z_INDEX = 55;
const SELECT_LIST_Z_INDEX = 60;

/**
 * Shared listbox select. It keeps the native form-facing API used by both
 * apps, while rendering the menu in a portal so it is not clipped by tables,
 * dialogs, or scrollable layout regions.
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
  size = "md",
  "aria-label": ariaLabel,
}: SelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [listPosition, setListPosition] = useState<ListPosition | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const listId = `${id ?? name ?? "select"}-options`;

  const firstEnabledIndex = (fromIndex: number, direction: 1 | -1): number => {
    if (options.length === 0) return -1;

    for (let offset = 0; offset < options.length; offset += 1) {
      const index = (fromIndex + offset * direction + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }

    return -1;
  };

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
    const nextIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(0, 1);
    setActiveIndex(nextIndex >= 0 ? nextIndex : 0);
  }, [isOpen, selectedIndex]);

  const openList = (nextIndex?: number): void => {
    setListPosition(null);
    if (nextIndex !== undefined) setActiveIndex(nextIndex);
    setIsOpen(true);
  };

  const closeList = (): void => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const selectOption = (option: SelectOption): void => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value, name } });
    closeList();
  };

  const moveActive = (direction: 1 | -1): void => {
    const nextIndex = firstEnabledIndex(activeIndex + direction, direction);
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList(
          event.key === "ArrowDown"
            ? firstEnabledIndex(0, 1)
            : firstEnabledIndex(options.length - 1, -1),
        );
      } else {
        moveActive(event.key === "ArrowDown" ? 1 : -1);
      }
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && !isOpen) {
      event.preventDefault();
      openList();
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeList();
    }
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
        aria-controls={isOpen ? listId : undefined}
        aria-expanded={isOpen}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={error ? true : undefined}
        onClick={() => (isOpen ? closeList() : openList())}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--surface-card)] px-3 text-left text-sm text-[var(--ink-primary)] outline-none transition-[background-color,border-color,box-shadow] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-subtle)] disabled:text-[var(--ink-muted)]",
          size === "sm" ? "h-8 py-1.5 text-xs" : "h-10 py-2.5",
          error ? "border-[var(--blush-action)]" : "border-[var(--control-border)]",
          className,
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-[var(--ink-muted)]")}>
          {selectedOption?.label ?? placeholder ?? ""}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-transform duration-150",
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
              onClick={closeList}
              className="fixed inset-0 cursor-default"
              style={{ zIndex: SELECT_BACKDROP_Z_INDEX }}
            />
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel ?? label}
              className="fixed max-h-60 max-w-[calc(100vw-1rem)] overflow-auto rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] py-1 text-sm shadow-[var(--popover-shadow)] motion-safe:animate-pte-dropdown-in"
              style={{
                top: listPosition?.top ?? 0,
                left: listPosition?.left ?? 0,
                minWidth: listPosition?.minWidth,
                visibility: listPosition ? "visible" : "hidden",
                zIndex: SELECT_LIST_Z_INDEX,
              }}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "mx-1 truncate rounded-md px-3 py-2 transition-colors",
                    option.disabled
                      ? "cursor-not-allowed text-[var(--ink-muted)]"
                      : option.value === value
                        ? "cursor-pointer bg-[var(--action)] text-[var(--action-foreground)]"
                        : index === activeIndex
                          ? "cursor-pointer bg-[var(--surface-subtle)] text-[var(--ink-primary)]"
                          : "cursor-pointer text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]",
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
