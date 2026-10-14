"use client";

import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../utils/cn";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from "./icons";

export type ToastTone = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  title?: string;
  dismissible: boolean;
}

export interface ShowToastOptions {
  tone?: ToastTone;
  /** How long the toast stays visible before auto-dismissing. Defaults to `DEFAULT_TOAST_DURATION_MS`. */
  durationMs?: number;
  /** Optional short heading shown above the message. */
  title?: string;
  /** Whether the toast includes a dismiss button. Defaults to `true`. */
  dismissible?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const DEFAULT_TOAST_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 3;

const TONE_ICON_CLASS: Record<ToastTone, string> = {
  info: "text-[var(--sky-action)]",
  success: "text-[var(--mint-action)]",
  warning: "text-[var(--cream-action)]",
  error: "text-[var(--blush-action)]",
};

const TONE_TEXT_CLASS: Record<ToastTone, string> = TONE_ICON_CLASS;

const TONE_ICON: Record<ToastTone, ComponentType<{ className?: string }>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  error: AlertTriangleIcon,
};

/** Mount once near the app root (see `Providers`). Consume with `useToast()`. */
export const ToastProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const { t } = useLocale();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(
    () => () => {
      timeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.current.clear();
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timeouts.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeouts.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const tone = options?.tone ?? "success";
      const durationMs = options?.durationMs ?? DEFAULT_TOAST_DURATION_MS;
      setToasts((current) =>
        [
          ...current,
          {
            id,
            tone,
            message,
            title: options?.title,
            dismissible: options?.dismissible ?? true,
          },
        ].slice(-MAX_VISIBLE_TOASTS),
      );
      if (durationMs > 0) {
        timeouts.current.set(
          id,
          setTimeout(() => dismiss(id), durationMs),
        );
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted &&
        createPortal(
          <section
            aria-live="polite"
            aria-atomic="false"
            className="fixed inset-x-0 top-[84px] z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end md:top-[100px]"
          >
            {toasts.map((toast) => {
              const Icon = TONE_ICON[toast.tone];
              return (
                <div
                  key={toast.id}
                  role={toast.tone === "error" ? "alert" : "status"}
                  className={cn(
                    "flex w-full max-w-md items-start gap-3 rounded-2xl border border-[var(--shell-border)] bg-[var(--surface-card)] py-3 pl-4 pr-3 text-sm shadow-[var(--popover-shadow)] motion-safe:animate-pte-fade-up sm:w-auto sm:min-w-72",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("mt-0.5 shrink-0", TONE_ICON_CLASS[toast.tone])}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-pretty">
                    {toast.title && (
                      <p className={cn("font-semibold", TONE_TEXT_CLASS[toast.tone])}>
                        {toast.title}
                      </p>
                    )}
                    <p className={cn(toast.title && "mt-0.5", TONE_TEXT_CLASS[toast.tone])}>
                      {toast.message}
                    </p>
                  </div>
                  {toast.dismissible && (
                    <button
                      type="button"
                      aria-label={t("common.close", "Close")}
                      onClick={() => dismiss(toast.id)}
                      className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </section>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
