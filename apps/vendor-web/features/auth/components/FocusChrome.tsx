"use client";

import type { ReactElement, ReactNode } from "react";
import {
  DashboardBreadcrumbProvider,
  LocaleSwitcher,
  ThemeToggle,
  type SessionRole,
} from "@pte/ui";
import { BackLink } from "@/lib/BackLink";
import { RequireAuth } from "./RequireAuth";

interface FocusChromeProps {
  children: ReactNode;
  allowedRoles: readonly SessionRole[];
  /** Where the back button leads when the page was not opened from another screen. */
  backHref: string;
  backLabel: string;
}

/**
 * A full-screen frame for work that is watched rather than navigated, like an AI generation run: no sidebar and no
 * header search, only the way back and the display settings, so the run gets the whole window.
 */
export const FocusChrome = ({
  children,
  allowedRoles,
  backHref,
  backLabel,
}: FocusChromeProps): ReactElement => (
  <RequireAuth allowedRoles={allowedRoles}>
    <DashboardBreadcrumbProvider>
      <div className="min-h-screen bg-[var(--surface-page)]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-4">
          <BackLink fallbackHref={backHref} fallbackLabel={backLabel} />
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6">{children}</main>
      </div>
    </DashboardBreadcrumbProvider>
  </RequireAuth>
);
