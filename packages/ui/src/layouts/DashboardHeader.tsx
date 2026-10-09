"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { HeaderSearch, type HeaderSearchItem } from "../components/HeaderSearch";
import { DotsVerticalIcon, MenuIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

export interface DashboardHeaderProps {
  brand?: ReactNode;
  search?: ReactNode;
  searchItems?: readonly HeaderSearchItem[];
  searchPlaceholder?: string;
  onSearchNavigate?: (url: string) => void;
  actions?: ReactNode;
  onMenuClick?: () => void;
}

export const DashboardHeader = ({
  brand,
  search,
  searchItems,
  searchPlaceholder,
  onSearchNavigate,
  actions,
  onMenuClick,
}: DashboardHeaderProps): ReactElement => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { t } = useLocale();
  const resolvedSearch =
    searchItems !== undefined ? (
      <HeaderSearch
        items={searchItems}
        placeholder={searchPlaceholder}
        onNavigate={onSearchNavigate}
      />
    ) : (
      search
    );

  return (
    <>
      <header className="sticky top-0 z-30 border-b-[0.5px] border-[var(--shell-border)] bg-[var(--shell-frame)] px-4 backdrop-blur-xl md:px-8">
        <div className="flex min-h-[72px] items-center md:hidden">
          <div className="flex flex-1 justify-start">
            <button
              type="button"
              aria-label={t("common.openMenu", "Open menu")}
              title={t("common.openMenu", "Open menu")}
              className="grid h-10 w-10 place-items-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
              onClick={onMenuClick}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="min-w-0 text-center">{brand}</div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              aria-label={t("common.options", "Options")}
              title={t("common.options", "Options")}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]",
                isQuickActionsOpen && "bg-[var(--surface-subtle)] text-[var(--ink-primary)]",
              )}
              onClick={() => setIsQuickActionsOpen((current) => !current)}
            >
              <DotsVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="hidden min-h-[72px] items-center gap-4 md:flex">
          <div className="min-w-0 shrink-0">{brand}</div>
          {resolvedSearch && <div className="min-w-0 max-w-xs flex-1">{resolvedSearch}</div>}
          <div className="ml-auto flex shrink-0 items-center gap-2.5">{actions}</div>
        </div>
      </header>

      {isQuickActionsOpen && (
        <div className="border-b border-[var(--shell-border)] bg-[var(--shell-frame)] px-4 py-3 md:hidden">
          <div className="flex items-center justify-end gap-2.5">{actions}</div>
        </div>
      )}
    </>
  );
};
