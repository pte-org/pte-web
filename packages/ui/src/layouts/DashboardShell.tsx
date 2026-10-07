"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { ChevronLeftIcon, ChevronRightIcon } from "../components/icons";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardShellProps {
  /** Brand block pinned to the top of the sidebar. */
  brand?: ReactNode;
  /** Sidebar navigation. Apps compose links and pass the result in. */
  sidebar: ReactNode;
  /** Brand shown on the left of the top header bar. */
  headerBrand?: ReactNode;
  /** Actions on the right of the top header bar. */
  headerActions?: ReactNode;
  /** Disclaimer / footer shown under the page content. */
  footer?: ReactNode;
  children: ReactNode;
}

const MENU_LABEL = "Mo menu";
const CLOSE_LABEL = "Dong menu";

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

  return (
    <div className="flex min-h-screen bg-shell-canvas">
      {/* Desktop Floating Edge Toggle Button (Notion / Linear style) */}
      <button
        type="button"
        aria-label={isDesktopOpen ? CLOSE_LABEL : MENU_LABEL}
        title={isDesktopOpen ? "Thu gọn thanh điều hướng" : "Mở rộng thanh điều hướng"}
        className={cn(
          "fixed top-[21px] z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all duration-300 ease-in-out hover:scale-110 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 md:flex",
          isDesktopOpen ? "left-[256px]" : "left-3.5",
        )}
        onClick={() => setIsDesktopOpen((prev) => !prev)}
      >
        {isDesktopOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[270px] shrink-0 flex-col border-r border-shell-border bg-shell-canvas text-slate-700 transition-transform duration-300 ease-in-out motion-safe:animate-pte-fade-in md:flex",
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
            aria-label={CLOSE_LABEL}
            className="absolute inset-0 bg-slate-900/40"
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
          "md:rounded-2xl md:border md:border-shell-border md:bg-shell-frame md:shadow-shell",
          isDesktopOpen ? "md:pl-[270px]" : "md:pl-0",
        )}
      >
        <DashboardHeader
          brand={headerBrand}
          actions={headerActions}
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 bg-shell-frame px-4 py-6 md:px-8 md:py-7">
          <div className="w-full">{children}</div>
        </main>
        {footer && (
          <footer className="border-t border-shell-border bg-shell-frame px-6 py-4 text-center text-xs text-gray-400">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
