"use client";

import { useEffect, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
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
  navigationKey?: string | null;
  children: ReactNode;
}

export const DashboardShell = ({
  brand,
  sidebar,
  headerBrand,
  headerActions,
  footer,
  navigationKey,
  children,
}: DashboardShellProps): ReactElement => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { t } = useLocale();
  const navigationLabel = isDesktopOpen
    ? t("common.collapseNavigation", "Collapse navigation")
    : t("common.expandNavigation", "Expand navigation");

  useEffect(() => {
    setIsNavigating(false);
  }, [navigationKey]);

  const handleNavigationClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const nextUrl = new URL(href, window.location.href);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl.origin !== window.location.origin || nextUrl.pathname + nextUrl.search === currentUrl) {
      return;
    }

    window.setTimeout(() => {
      if (!event.defaultPrevented) setIsNavigating(true);
    }, 0);
  };

  return (
    <div
      className="relative flex min-h-screen bg-[var(--shell-canvas)] text-[var(--ink-primary)]"
      onClickCapture={handleNavigationClick}
    >
      {isNavigating && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
          role="progressbar"
          aria-label={t("common.loading", "Loading")}
        >
          <div className="h-full w-1/3 bg-[var(--action)] motion-safe:animate-pte-progress motion-reduce:w-1/2" />
        </div>
      )}
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
