"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
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
  /**
   * Allows a caller to opt into closing when the backdrop is clicked.
   *
   * Keep this disabled by default so forms and dialogs with unsaved state are
   * not dismissed by an accidental click outside the modal content.
   */
  closeOnBackdropClick?: boolean;
  /** Prevent dismissal while a mutation owns this dialog. */
  isDismissDisabled?: boolean;
}

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
  closeOnBackdropClick = false,
  isDismissDisabled = false,
}: ModalProps): ReactElement | null => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !isDismissDisabled) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isDismissDisabled]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 motion-safe:animate-pte-fade-in"
      onClick={closeOnBackdropClick && !isDismissDisabled ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-h-[90vh] w-full overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] shadow-[var(--card-shadow)] motion-safe:animate-pte-scale-in",
          SIZE_CLASS[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--shell-border)] px-5 py-4">
            <h2 className="text-base font-semibold text-[var(--ink-primary)]">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              disabled={isDismissDisabled}
              onClick={onClose}
              className="rounded-md p-1 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div
            className={cn(
              "flex justify-end gap-2 border-t border-[var(--shell-border)] bg-[var(--surface-card)] px-5 py-4",
              stickyFooter && "sticky bottom-0",
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    portalTarget,
  );
};
