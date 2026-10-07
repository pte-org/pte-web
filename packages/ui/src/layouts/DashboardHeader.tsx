"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { DotsVerticalIcon, MenuIcon } from "../components/icons";
import { cn } from "../utils/cn";

export interface DashboardHeaderProps {
  brand?: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
}

const MENU_LABEL = "Mo menu";
const QUICK_ACTIONS_LABEL = "Mo nhanh thao tac";

/** PTE adaptation of NextAdmin's responsive header chrome. */
export const DashboardHeader = ({
  brand,
  actions,
  onMenuClick,
}: DashboardHeaderProps): ReactElement => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-shell-border bg-shell-frame px-4 backdrop-blur-xl md:px-8">
        <div className="flex min-h-[72px] items-center md:hidden">
          <div className="flex flex-1 justify-start">
            <button
              type="button"
              aria-label={MENU_LABEL}
              title={MENU_LABEL}
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              onClick={onMenuClick}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="min-w-0 text-center">{brand}</div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              aria-label={QUICK_ACTIONS_LABEL}
              title={QUICK_ACTIONS_LABEL}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                isQuickActionsOpen && "bg-slate-100 text-slate-950",
              )}
              onClick={() => setIsQuickActionsOpen((current) => !current)}
            >
              <DotsVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="hidden min-h-[72px] items-center justify-between gap-4 md:flex">
          <div className="min-w-0">{brand}</div>
          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        </div>
      </header>

      {isQuickActionsOpen && (
        <div className="border-b border-shell-border bg-shell-frame px-4 py-3 md:hidden">
          <div className="flex items-center justify-end gap-2.5">{actions}</div>
        </div>
      )}
    </>
  );
};
