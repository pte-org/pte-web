"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ErrorPage, errorPageKindOf, type ErrorPageKind, type ErrorPageLinkProps } from "@pte/ui";

interface AppErrorPageProps {
  /** The caught error; its HTTP status (from the API client) picks the kind of page. */
  error?: unknown;
  kind?: ErrorPageKind;
  /** Text for a route that failed for no known status, e.g. "We could not load this exam." */
  description?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  /** Replaces the way home, e.g. the sign-in page. */
  action?: { href: string; label: string };
}

const nextLink = ({ href, className, children }: ErrorPageLinkProps): ReactElement => (
  <Link href={href} className={className}>{children}</Link>
);

/** The app's error page: the shared design, with client navigation back to the home page. */
export const AppErrorPage = ({ error, kind, description, onRetry, fullScreen, action }: AppErrorPageProps): ReactElement => {
  const resolved = kind ?? errorPageKindOf(error);
  return (
    <ErrorPage kind={resolved} description={resolved === "generic" ? description : undefined} homeHref="/"
      renderLink={nextLink} onRetry={onRetry} fullScreen={fullScreen} action={action} />
  );
};
