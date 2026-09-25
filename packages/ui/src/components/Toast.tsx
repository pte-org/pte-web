"use client";

import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from "./icons";

export type ToastTone = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

export interface ShowToastOptions {
  tone?: ToastTone;
  /** How long the toast stays visible before auto-dismissing. Defaults to `DEFAULT_TOAST_DURATION_MS`. */
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const DEFAULT_TOAST_DURATION_MS = 5000;
const DISMISS_LABEL = "Dismiss";

const TONE_CLASS: Record<ToastTone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

const TONE_ICON: Record<ToastTone, ComponentType<{ className?: string }>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  error: AlertTriangleIcon,
};

/** Mount once near the app root (see `Providers`). Consume with `useToast()`. */
export const ToastProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());

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
      setToasts((current) => [...current, { id, tone, message }]);
      timeouts.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs),
      );
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
            {toasts.map((toast) => {
              const Icon = TONE_ICON[toast.tone];
              return (
                <div
                  key={toast.id}
                  role="status"
                  className={cn(
                    "flex w-full max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg",
                    TONE_CLASS[toast.tone],
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="flex-1">{toast.message}</p>
                  <button
                    type="button"
                    aria-label={DISMISS_LABEL}
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>,
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
