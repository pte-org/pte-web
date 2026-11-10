"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../i18n";
import { XIcon } from "./icons";
import { cn } from "../utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  /** Lets the user drag the inner edge (or press the arrow keys on it) to change the width. */
  resizable?: boolean;
  /** Where to remember the chosen width between visits; the width is not kept without it. */
  widthStorageKey?: string;
}

const MIN_WIDTH = 384;
const VIEWPORT_MARGIN = 32;
const KEY_STEP = 24;

const clampWidth = (width: number): number =>
  Math.round(
    Math.min(Math.max(width, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth - VIEWPORT_MARGIN)),
  );

const readStoredWidth = (key: string | undefined): number | null => {
  if (!key || typeof window === "undefined") return null;
  const stored = Number(window.localStorage.getItem(key));
  return Number.isFinite(stored) && stored > 0 ? clampWidth(stored) : null;
};

export const Drawer = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  resizable = false,
  widthStorageKey,
}: DrawerProps): ReactElement | null => {
  const [width, setWidth] = useState<number | null>(() => readStoredWidth(widthStorageKey));
  const draggingRef = useRef(false);
  const widthRef = useRef<number | null>(width);
  const applyWidth = (next: number): void => {
    const clamped = clampWidth(next);
    widthRef.current = clamped;
    setWidth(clamped);
  };
  const rememberWidth = (): void => {
    if (widthStorageKey && widthRef.current !== null) {
      window.localStorage.setItem(widthStorageKey, String(widthRef.current));
    }
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    applyWidth(side === "right" ? window.innerWidth - event.clientX : event.clientX);
  };
  const handleResizeKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const grows = (event.key === "ArrowLeft") === (side === "right");
    const current =
      widthRef.current ?? panelRef.current?.getBoundingClientRect().width ?? MIN_WIDTH;
    applyWidth(current + (grows ? KEY_STEP : -KEY_STEP));
    rememberWidth();
  };
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const { t } = useLocale();
  const closeLabel = t("common.close", "Close");
  const resizeLabel = t("common.resizePanel", "Resize panel");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusableElements = (): HTMLElement[] =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 flex w-full max-w-xl flex-col bg-[var(--surface-card)] shadow-2xl motion-safe:animate-pte-fade-in sm:w-[min(34rem,calc(100vw-2rem))]",
          side === "right" ? "right-0" : "left-0",
        )}
        style={resizable && width !== null ? { width, maxWidth: "none" } : undefined}
      >
        {resizable && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={resizeLabel}
            tabIndex={0}
            onPointerDown={(event) => {
              draggingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              draggingRef.current = false;
              rememberWidth();
            }}
            onKeyDown={handleResizeKey}
            className={cn(
              "absolute inset-y-0 z-10 w-1.5 cursor-col-resize touch-none transition-colors hover:bg-[var(--brand)]/40 focus-visible:bg-[var(--brand)]/60 focus-visible:outline-none active:bg-[var(--brand)]/60",
              side === "right" ? "left-0" : "right-0",
            )}
          />
        )}
        <header className="flex items-start justify-between gap-4 border-b border-[var(--shell-border)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--ink-primary)]">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">{description}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-[var(--shell-border)] px-5 py-4">{footer}</footer>
        )}
      </aside>
    </div>
  );
};
