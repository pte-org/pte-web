import type { ReactElement, ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

export interface DashboardSidebarRenderContext {
  isSidebarOpen: boolean;
  isMobile: boolean;
  onItemClick?: () => void;
}

type DashboardSidebarSlot = ReactNode | ((context: DashboardSidebarRenderContext) => ReactNode);

export interface DashboardSidebarProps {
  brand?: DashboardSidebarSlot;
  children: DashboardSidebarSlot;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

const renderSlot = (
  slot: DashboardSidebarSlot | undefined,
  context: DashboardSidebarRenderContext,
): ReactNode => (typeof slot === "function" ? slot(context) : slot);

export const DashboardSidebar = ({
  brand,
  children,
  isMobile = false,
  isCollapsed = false,
  onToggle,
  onItemClick,
}: DashboardSidebarProps): ReactElement => {
  const { t } = useLocale();
  const isSidebarOpen = isMobile || !isCollapsed;
  const context: DashboardSidebarRenderContext = {
    isSidebarOpen,
    isMobile,
    onItemClick,
  };
  const closeLabel = isMobile
    ? t("common.closeMenu", "Close menu")
    : isSidebarOpen
      ? t("common.collapseNavigation", "Collapse navigation")
      : t("common.expandNavigation", "Expand navigation");

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden text-[var(--ink-secondary)]",
        isMobile
          ? "w-[270px] max-w-[85vw] bg-[var(--shell-frame)] shadow-sidebar"
          : "w-full bg-[var(--shell-canvas)]",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center text-[var(--ink-primary)]",
          isSidebarOpen
            ? "min-h-[82px] justify-between gap-3 px-4 pb-2 pt-5"
            : "flex-col justify-center gap-3 px-2 pb-3 pt-5",
        )}
      >
        <div className={cn("min-w-0", isSidebarOpen ? "flex-1" : "w-full")}>
          {renderSlot(brand, context)}
        </div>
        {onToggle && (
          <button
            type="button"
            aria-label={closeLabel}
            title={closeLabel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
            onClick={() => {
              onToggle();
              if (isMobile) onItemClick?.();
            }}
          >
            {isMobile ? (
              <XIcon className="h-[18px] w-[18px]" />
            ) : isSidebarOpen ? (
              <ChevronLeftIcon className="h-[18px] w-[18px]" />
            ) : (
              <ChevronRightIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>

      <nav
        className={cn(
          "scrollbar-thin flex flex-1 flex-col overflow-y-auto pb-4",
          isSidebarOpen ? "px-4 pt-2" : "px-2 pt-1",
        )}
      >
        {renderSlot(children, context)}
      </nav>
    </aside>
  );
};
