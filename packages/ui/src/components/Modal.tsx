"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { XIcon } from "./icons";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** When omitted, the header bar (title + close button) is not rendered. */
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  stickyFooter?: boolean;
}

const CLOSE_LABEL = "Close";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-5xl",
};

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  stickyFooter = false,
}: ModalProps): ReactElement | null => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-xl",
          SIZE_CLASS[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              aria-label={CLOSE_LABEL}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div
            className={cn(
              "flex justify-end gap-2 border-t border-gray-100 bg-white px-5 py-4",
              stickyFooter && "sticky bottom-0",
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
