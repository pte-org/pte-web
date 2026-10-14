"use client";

import { useEffect, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import type { HeaderSearchItem } from "../components/HeaderSearch";
import { cn } from "../utils/cn";
import { useLocale } from "../i18n";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar, type DashboardSidebarRenderContext } from "./DashboardSidebar";

type DashboardShellSlot = ReactNode | ((context: DashboardSidebarRenderContext) => ReactNode);

export interface DashboardShellProps {
  brand?: DashboardShellSlot;
  sidebar: DashboardShellSlot;
  headerBrand?: ReactNode;
  headerSearch?: ReactNode;
  headerSearchItems?: readonly HeaderSearchItem[];
  headerSearchPlaceholder?: string;
  onHeaderSearchNavigate?: (url: string) => void;
  headerActions?: ReactNode;
  breadcrumbs?: ReactNode;
  footer?: ReactNode;
  navigationKey?: string | null;
  children: ReactNode;
}

export const DashboardShell = ({
  brand,
  sidebar,
  headerBrand,
  headerSearch,
  headerSearchItems,
  headerSearchPlaceholder,
  onHeaderSearchNavigate,
  headerActions,
  breadcrumbs,
  footer,
  navigationKey,
  children,
}: DashboardShellProps): ReactElement => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIsNavigating(false);
  }, [navigationKey]);

  const handleNavigationClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
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
    if (
      nextUrl.origin !== window.location.origin ||
      nextUrl.pathname + nextUrl.search === currentUrl
    ) {
      return;
    }

    window.setTimeout(() => {
      if (!event.defaultPrevented) setIsNavigating(true);
    }, 0);
  };

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-[var(--shell-canvas)] text-[var(--ink-primary)]"
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
      <aside
        style={{
          width: isDesktopOpen ? "270px" : "72px",
          minWidth: isDesktopOpen ? "270px" : "72px",
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col text-[var(--ink-secondary)] transition-[width,min-width] duration-300 ease-in-out motion-safe:animate-pte-fade-in md:flex",
        )}
      >
        <DashboardSidebar
          brand={brand}
          isCollapsed={!isDesktopOpen}
          onToggle={() => setIsDesktopOpen((prev) => !prev)}
        >
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
          "min-h-0 min-w-0 flex-1 transition-all duration-300 ease-in-out md:py-4 md:pr-4",
          isDesktopOpen ? "md:pl-[286px]" : "md:pl-[88px]",
        )}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden md:rounded-2xl md:border-[0.5px] md:border-[var(--shell-surface-border)] md:bg-[var(--shell-frame)] md:shadow-shell">
          <DashboardHeader
            brand={headerBrand}
            search={headerSearch}
            searchItems={headerSearchItems}
            searchPlaceholder={headerSearchPlaceholder}
            onSearchNavigate={onHeaderSearchNavigate}
            actions={headerActions}
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--shell-frame)] px-4 py-6 md:px-8 md:py-7">
            <div className="w-full">
              {breadcrumbs && <div className="mb-5 flex justify-start">{breadcrumbs}</div>}
              {children}
            </div>
          </main>
          {footer && (
            <footer className="border-t border-[var(--shell-border)] bg-[var(--shell-frame)] px-6 py-4 text-center text-xs text-[var(--ink-muted)]">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};
