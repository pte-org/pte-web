"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { DotsVerticalIcon } from "./icons";

export interface DropdownActionItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  hidden?: boolean;
}

export interface DropdownSeparator {
  separator: true;
  key?: string;
}

export type DropdownItem = DropdownActionItem | DropdownSeparator;

export interface DropdownProps {
  items: DropdownItem[];
  /** Accessible name for the trigger button. */
  label?: string;
  /** Custom trigger content; defaults to a kebab icon. */
  trigger?: ReactNode;
  triggerClassName?: string;
  align?: "left" | "right";
}

export const Dropdown = ({
  items,
  label = "Options",
  trigger,
  triggerClassName,
  align = "right",
}: DropdownProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = (): void => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 4;
      const viewportPadding = 8;
      const opensAbove =
        triggerRect.bottom + gap + menuRect.height > window.innerHeight &&
        triggerRect.top - gap - menuRect.height >= viewportPadding;
      const top = opensAbove ? triggerRect.top - gap - menuRect.height : triggerRect.bottom + gap;
      const preferredLeft =
        align === "right" ? triggerRect.right - menuRect.width : triggerRect.left;
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - menuRect.width - viewportPadding,
      );

      setMenuPosition({
        top: Math.max(
          viewportPadding,
          Math.min(top, window.innerHeight - menuRect.height - viewportPadding),
        ),
        left: Math.max(viewportPadding, Math.min(preferredLeft, maxLeft)),
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [align, open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setMenuPosition(null);
          setOpen((value) => !value);
        }}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-md text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700",
          triggerClassName,
        )}
      >
        {trigger ?? <DotsVerticalIcon className="h-5 w-5" />}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[55] cursor-default"
            />
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[60] min-w-44 max-w-[calc(100vw-1rem)] rounded-md bg-white py-1 shadow-card"
              style={{
                top: menuPosition?.top ?? 0,
                left: menuPosition?.left ?? 0,
                visibility: menuPosition ? "visible" : "hidden",
              }}
            >
              {items
                .filter((item) => !("hidden" in item && item.hidden))
                .map((item, index) => {
                  if ("separator" in item) {
                    return (
                      <div
                        key={item.key ?? `separator-${index}`}
                        role="separator"
                        className="my-1 border-t border-gray-100"
                      />
                    );
                  }
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return;
                        item.onSelect();
                        setOpen(false);
                      }}
                      className={cn(
                        "flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50",
                        item.danger ? "text-red-600" : "text-gray-700",
                      )}
                    >
                      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                      {item.label}
                    </button>
                  );
                })}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
