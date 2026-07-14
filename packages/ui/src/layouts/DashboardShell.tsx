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
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-800 text-slate-300 shadow-xl md:flex">
        {brand && <div className="border-b border-white/10 px-5 py-5">{brand}</div>}
        <nav className="flex flex-1 flex-col gap-1 p-3">{sidebar}</nav>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={CLOSE_LABEL}
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-slate-800 text-slate-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>{brand}</div>
              <button
                type="button"
                aria-label={CLOSE_LABEL}
                className="text-slate-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">{sidebar}</nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={MENU_LABEL}
              className="text-gray-600 hover:text-gray-900 md:hidden"
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
        <main className="flex-1 bg-slate-100 p-4 md:p-6">{children}</main>
        {footer && (
          <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-xs text-gray-400">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
