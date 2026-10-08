import type { ReactElement, ReactNode } from "react";
import { ChevronLeftIcon, XIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

export interface DashboardSidebarProps {
  brand?: ReactNode;
  children: ReactNode;
  isMobile?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

export const DashboardSidebar = ({
  brand,
  children,
  isMobile = false,
  onToggle,
  onItemClick,
}: DashboardSidebarProps): ReactElement => {
  const { t } = useLocale();
  const closeLabel = isMobile
    ? t("common.closeMenu", "Close menu")
    : t("common.collapseNavigation", "Collapse navigation");

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden text-[var(--ink-secondary)]",
        isMobile
          ? "w-[270px] max-w-[85vw] bg-[var(--shell-frame)] shadow-sidebar"
          : "w-full border-r border-[var(--shell-border)] bg-[var(--shell-canvas)]",
      )}
    >
      <div
        className={cn(
          "flex items-center px-4 pt-6 text-[var(--ink-primary)]",
          isMobile ? "min-h-[70px] justify-between" : "min-h-[88px] justify-between",
        )}
      >
        <div className="min-w-0 flex-1">{brand}</div>
        {onToggle && (
          <button
            type="button"
            aria-label={closeLabel}
            title={closeLabel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
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
};
