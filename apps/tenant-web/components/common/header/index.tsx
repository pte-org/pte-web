"use client";

import { DotsVerticalIcon, MenuIcon, cn } from "@pte/ui";
import type { ReactNode } from "react";
import { useState } from "react";

//  Main Header
export default function Header({
  brand,
  search,
  actions,
  onMenuClick,
}: {
  brand?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-card-border bg-card-surface-area px-2 py-4 lg:px-5">
        {/* Mobile layout (< xl): menu | brand | quick actions */}
        <div className="flex items-center xl:hidden">
          <div className="flex flex-1 justify-start">
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={onMenuClick}
              aria-label="Open sidebar menu"
              className="rounded-md px-1.5 py-1 text-icon-tertiary transition-colors hover:text-text-primary"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="min-w-0 text-center">{brand}</div>

          <div className="flex flex-1 justify-end">
            <button
              type="button"
              id="mobile-info-toggle"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              aria-label="Open quick access"
              className={cn(
                "rounded-md px-1.5 py-3 transition-colors",
                isDrawerOpen
                  ? "bg-background-gray-secondary text-text-primary"
                  : "text-icon-tertiary hover:text-text-primary",
              )}
            >
              <DotsVerticalIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Desktop layout (xl+) */}
        <div className="hidden items-center justify-between xl:flex">
          <div className="max-w-sm flex-1">{search ?? brand}</div>
          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        </div>
      </header>

      {isDrawerOpen && (
        <div className="border-b border-card-border bg-card-surface-area px-5 py-4 shadow-xs xl:hidden">
          <div className="flex items-center justify-between gap-3">
            {search}
            <div className="flex items-center gap-2.5">{actions}</div>
          </div>
        </div>
      )}
    </>
  );
}
