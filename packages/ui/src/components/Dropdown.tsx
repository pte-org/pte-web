"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { DotsVerticalIcon } from "./icons";

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

interface DropdownProps {
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

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full text-gray-500 hover:bg-gray-100",
          triggerClassName,
        )}
      >
        {trigger ?? <DotsVerticalIcon className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className={cn(
              "absolute z-20 mt-1 min-w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
                  item.danger ? "text-red-600" : "text-gray-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
