"use client";

import { cn, useLocale } from "@pte/ui";
import type { MouseEvent, ReactElement, ReactNode } from "react";
import { useState } from "react";
import Header from "./header";
import Sidebar, { type SidebarRenderContext } from "./sidebar";

export interface CommonDashboardLayoutProps {
  brand?: ReactNode | ((context: SidebarRenderContext) => ReactNode);
  sidebar: (context: SidebarRenderContext) => ReactNode;
  headerBrand?: ReactNode;
  headerSearch?: ReactNode;
  headerActions?: ReactNode;
  breadcrumbs?: ReactNode;
  footer?: ReactNode;
  navigationKey?: string | null;
  children: ReactNode;
}

export const CommonDashboardLayout = ({
  brand,
  sidebar,
  headerBrand,
  headerSearch,
  headerActions,
  breadcrumbs,
  footer,
  navigationKey,
  children,
}: CommonDashboardLayoutProps): ReactElement => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [navigationState, setNavigationState] = useState<{
    key: string | null | undefined;
    active: boolean;
  }>({ key: navigationKey, active: false });
  const { t } = useLocale();
  const isNavigating = navigationState.active && navigationState.key === navigationKey;

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
      if (!event.defaultPrevented) {
        setNavigationState({ key: navigationKey, active: true });
      }
    }, 0);
  };

  return (
    <div
      className="relative flex min-h-screen bg-card-background text-text-primary"
      onClickCapture={handleNavigationClick}
    >
      {isNavigating && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
          role="progressbar"
          aria-label={t("common.loading", "Loading")}
        >
          <div className="h-full w-1/3 bg-brand-500 motion-safe:animate-pte-progress motion-reduce:w-1/2" />
        </div>
      )}

      <aside
        style={{
          width: isSidebarOpen ? "270px" : "72px",
          minWidth: isSidebarOpen ? "270px" : "72px",
          transition:
            "width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="hidden shrink-0 overflow-hidden xl:block"
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((current) => !current)}
          brand={brand}
        >
          {sidebar}
        </Sidebar>
      </aside>

      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label={t("common.closeMenu", "Close menu")}
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          <aside className="relative z-10 h-full w-[270px] max-w-[85vw] motion-safe:animate-pte-fade-in">
            <Sidebar
              isSidebarOpen
              isMobileSheet
              toggleSidebar={() => setIsMobileSheetOpen(false)}
              onItemClick={() => setIsMobileSheetOpen(false)}
              brand={brand}
            >
              {sidebar}
            </Sidebar>
          </aside>
        </div>
      )}

      <div
        className={cn(
          "min-w-0 flex-1",
          isSidebarOpen ? "lg:p-4 xl:pr-4" : "lg:py-4 xl:px-4",
        )}
      >
        <div className="flex min-h-screen flex-col overflow-hidden border-[0.5px] border-card-surface-border bg-card-surface-area lg:min-h-[calc(100vh-2rem)] lg:rounded-2xl lg:shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.04)]">
          <Header
            brand={headerBrand}
            search={headerSearch}
            actions={headerActions}
            onMenuClick={() => setIsMobileSheetOpen(true)}
          />

          <main className="scrollbar-thin flex min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1536px] px-5 pb-6 pt-5 lg:px-10 lg:pt-6">
              {breadcrumbs && <div className="mb-5 flex justify-end">{breadcrumbs}</div>}
              {children}
            </div>
          </main>

          {footer && (
            <footer className="border-t border-card-surface-border bg-card-surface-area px-6 py-4 text-center text-xs text-text-tertiary">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonDashboardLayout;
