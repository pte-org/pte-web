import type { ReactElement, ReactNode } from "react";
import { ChevronLeftIcon, XIcon } from "../components/icons";
import { cn } from "../utils/cn";

export interface DashboardSidebarProps {
  brand?: ReactNode;
  children: ReactNode;
  isMobile?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

/** PTE adaptation of NextAdmin's sidebar frame. */
export const DashboardSidebar = ({
  brand,
  children,
  isMobile = false,
  onToggle,
  onItemClick,
}: DashboardSidebarProps): ReactElement => (
  <aside
    className={cn(
      "flex h-full flex-col overflow-hidden text-slate-700",
      isMobile
        ? "w-[270px] max-w-[85vw] bg-shell-frame shadow-sidebar"
        : "w-full border-r border-shell-border bg-shell-canvas",
    )}
  >
    <div
      className={cn(
        "flex items-center px-4 pt-6 text-slate-950",
        isMobile ? "min-h-[70px] justify-between" : "min-h-[88px] justify-between",
      )}
    >
      <div className="min-w-0 flex-1">{brand}</div>
      {onToggle && (
        <button
          type="button"
          aria-label={isMobile ? "Dong menu" : "Thu gon thanh dieu huong"}
          title={isMobile ? "Dong menu" : "Thu gon thanh dieu huong"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-950"
          onClick={() => {
            onToggle();
            if (isMobile) onItemClick?.();
          }}
        >
          {isMobile ? <XIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>
      )}
    </div>

    <nav className="scrollbar-thin flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 pt-3">
      {children}
    </nav>
  </aside>
);
