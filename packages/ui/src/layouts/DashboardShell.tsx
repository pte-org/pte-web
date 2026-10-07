"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { ChevronLeftIcon, ChevronRightIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardShellProps {
  brand?: ReactNode;
  sidebar: ReactNode;
  headerBrand?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const DashboardShell = ({
  brand,
  sidebar,
  headerBrand,
  headerActions,
  footer,
  children,
}: DashboardShellProps): ReactElement => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const { t } = useLocale();
  const navigationLabel = isDesktopOpen
    ? t("common.collapseNavigation", "Collapse navigation")
    : t("common.expandNavigation", "Expand navigation");

  return (
    <div className="flex min-h-screen bg-[var(--shell-canvas)] text-[var(--ink-primary)]">
      <button
        type="button"
        aria-label={navigationLabel}
        title={navigationLabel}
        className={cn(
          "fixed top-[21px] z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-secondary)] shadow-md transition-all duration-300 ease-in-out hover:scale-110 hover:border-[var(--brand)] hover:bg-[var(--brand-tint)] hover:text-[var(--brand-ink)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] active:scale-95 md:flex",
          isDesktopOpen ? "left-[256px]" : "left-3.5",
        )}
        onClick={() => setIsDesktopOpen((prev) => !prev)}
      >
        {isDesktopOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[270px] shrink-0 flex-col border-r border-[var(--shell-border)] bg-[var(--shell-canvas)] text-[var(--ink-secondary)] transition-transform duration-300 ease-in-out motion-safe:animate-pte-fade-in md:flex",
          isDesktopOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <DashboardSidebar brand={brand} onToggle={() => setIsDesktopOpen((prev) => !prev)}>
          {sidebar}
        </DashboardSidebar>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={t("common.closeMenu", "Close menu")}
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative z-10 h-full motion-safe:animate-pte-fade-in">
            <DashboardSidebar
              brand={brand}
              isMobile
              onToggle={() => setIsSidebarOpen(false)}
              onItemClick={() => setIsSidebarOpen(false)}
            >
              {sidebar}
            </DashboardSidebar>
          </aside>
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out md:my-4 md:pr-4",
          "md:rounded-2xl md:border md:border-[var(--shell-border)] md:bg-[var(--shell-frame)] md:shadow-shell",
          isDesktopOpen ? "md:pl-[270px]" : "md:pl-0",
        )}
      >
        <DashboardHeader
          brand={headerBrand}
          actions={headerActions}
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 bg-[var(--shell-frame)] px-4 py-6 md:px-8 md:py-7">
          <div className="w-full">{children}</div>
        </main>
        {footer && (
          <footer className="border-t border-[var(--shell-border)] bg-[var(--shell-frame)] px-6 py-4 text-center text-xs text-[var(--ink-muted)]">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
