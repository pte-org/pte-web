"use client";

import type { ReactElement, ReactNode } from "react";
import { useLocale } from "../i18n";
import { PRIMARY_ACTION_SURFACE_CLASSES } from "../styles/interactiveClasses";
import { cn } from "../utils/cn";
import { ErrorIllustration } from "./ErrorIllustration";
import { ChevronLeftIcon } from "./icons";

/** What went wrong, which picks the title, the text and the status code shown. */
export type ErrorPageKind = "notFound" | "unauthorized" | "forbidden" | "server" | "unavailable" | "network" | "generic";

export interface ErrorPageLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

export interface ErrorPageProps {
  kind?: ErrorPageKind;
  /** Replaces the text of the kind, e.g. "We could not load this exam." */
  description?: string;
  homeHref: string;
  /** Next.js apps pass their `Link`, so going home stays a client navigation. */
  renderLink?: (props: ErrorPageLinkProps) => ReactElement;
  /** Shown as "Try again" when the page can be loaded again (route error boundaries). */
  onRetry?: () => void;
  /** Fills the screen (not-found and global errors) instead of the content area. */
  fullScreen?: boolean;
  /** Replaces the way home, e.g. the sign-in page for a signed-out visitor. */
  action?: { href: string; label: string };
}

const STATUS_CODES: Partial<Record<ErrorPageKind, string>> = {
  notFound: "404",
  unauthorized: "401",
  forbidden: "403",
  server: "500",
  unavailable: "503",
};

const FALLBACK_TEXT: Record<ErrorPageKind, { title: string; description: string }> = {
  notFound: { title: "Page not found!", description: "The page you are looking for doesn't exist or has been moved." },
  unauthorized: { title: "Please sign in", description: "Your session has ended. Sign in again to continue." },
  forbidden: { title: "Access denied", description: "You do not have permission to view this page." },
  server: { title: "Something went wrong", description: "The server ran into a problem. Please try again in a moment." },
  unavailable: { title: "Service unavailable", description: "The service is busy or under maintenance. Please try again later." },
  network: { title: "Connection lost", description: "Unable to connect to the server. Check your connection and try again." },
  generic: { title: "Something went wrong", description: "We could not load this page. Please try again." },
};

const BUTTON_BASE =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition";

const defaultLink = ({ href, className, children }: ErrorPageLinkProps): ReactElement => (
  <a href={href} className={className}>{children}</a>
);

/** Reads the kind from an error thrown by the API client (its HTTP status), or "generic" when it has none. */
export const errorPageKindOf = (error: unknown): ErrorPageKind => {
  const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
  if (typeof status !== "number") return "generic";
  if (status === 0) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 503) return "unavailable";
  return status >= 500 ? "server" : "generic";
};

/** The error page of every app: the illustration, a title and text for the kind, and the way back home. */
export const ErrorPage = ({
  kind = "generic",
  description,
  homeHref,
  renderLink = defaultLink,
  onRetry,
  fullScreen = false,
  action,
}: ErrorPageProps): ReactElement => {
  const { t } = useLocale();
  const code = STATUS_CODES[kind];
  const title = t(`errorPage.${kind}.title`, FALLBACK_TEXT[kind].title);
  const text = description ?? t(`errorPage.${kind}.description`, FALLBACK_TEXT[kind].description);

  return (
    <div className={cn("flex w-full items-center justify-center p-4 sm:p-6", fullScreen ? "min-h-screen bg-[var(--surface-page)]" : "min-h-[60vh]")}>
      <div className="flex w-full max-w-4xl flex-col items-center px-5 pt-10 pb-16">
        <div className="flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-full border border-[var(--divider)]">
          <ErrorIllustration className="h-auto w-full" />
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          {code ? <p className="text-sm font-semibold tracking-widest text-[var(--action)]">{code}</p> : null}
          <h1 className="text-3xl font-semibold text-[var(--ink-primary)] sm:text-4xl">{title}</h1>
          <p className="max-w-md text-sm text-[var(--ink-muted)]">{text}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button type="button" onClick={onRetry}
              className={cn(BUTTON_BASE, "border border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]")}>
              {t("errorPage.retry", "Try again")}
            </button>
          ) : null}
          {renderLink({
            href: action?.href ?? homeHref,
            className: cn(BUTTON_BASE, PRIMARY_ACTION_SURFACE_CLASSES),
            children: action ? <span>{action.label}</span> : (
              <>
                <ChevronLeftIcon className="h-4 w-4" />
                <span>{t("errorPage.home", "Back to home")}</span>
              </>
            ),
          })}
        </div>
      </div>
    </div>
  );
};
