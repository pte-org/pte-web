"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { MenuIcon, XIcon } from "../components/icons";

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] shrink-0 flex-col bg-white text-slate-700 shadow-sidebar md:flex">
        {brand && <div className="flex min-h-[70px] items-center px-6">{brand}</div>}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">{sidebar}</nav>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={CLOSE_LABEL}
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[270px] max-w-[85vw] flex-col bg-white text-slate-700 shadow-sidebar">
            <div className="flex min-h-[70px] items-center justify-between px-6">
              <div>{brand}</div>
              <button
                type="button"
                aria-label={CLOSE_LABEL}
                className="grid h-10 w-10 place-items-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">{sidebar}</nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:pl-[270px]">
        <header className="sticky top-0 z-30 flex min-h-[70px] items-center justify-between gap-3 bg-white/95 px-4 shadow-[0_1px_8px_rgba(145,158,171,0.12)] backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={MENU_LABEL}
              className="grid h-10 w-10 place-items-center rounded-md text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="min-w-0">{headerBrand}</div>
          </div>
          <div className={cn("flex shrink-0 items-center gap-3", !headerActions && "hidden")}>
            {headerActions}
          </div>
        </header>
        <main className="flex-1 bg-slate-100 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
        {footer && (
          <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-xs text-gray-400">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
