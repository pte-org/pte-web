import type { ReactElement, ReactNode } from "react";
import { DotsHorizontalIcon } from "./icons";
import { cn } from "../utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
  section?: string;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  isOpen?: boolean;
  renderLink: (item: SidebarNavItem, className: string) => ReactNode;
}

/**
 * Shared navigation rhythm used by both dashboard applications.
 *
 * The component intentionally owns presentation only. Applications still
 * provide their authorized routes and render the actual Next Link, which
 * keeps this package independent from Next.js while keeping the sidebar
 * identical across tenant and vendor.
 */
export const SidebarNav = ({ items, isOpen = true, renderLink }: SidebarNavProps): ReactElement => {
  return (
    <div className={cn("flex flex-col", isOpen ? "gap-1" : "gap-1.5")}>
      {items.map((item, index) => {
        const isSectionStart = index === 0 || item.section !== items[index - 1]?.section;

        return (
          <div key={item.href} className="flex flex-col gap-1">
            {isSectionStart &&
              item.section &&
              (isOpen ? (
                <p
                  className={cn(
                    "mb-2 px-3 text-xs font-medium uppercase tracking-[0.04em] text-[var(--ink-muted)]",
                    index === 0 ? "mt-1" : "mt-5",
                  )}
                >
                  {item.section}
                </p>
              ) : (
                <span
                  className="flex items-center justify-center px-3 pb-2 pt-4 text-[var(--ink-muted)]"
                  aria-hidden="true"
                >
                  <DotsHorizontalIcon className="h-3.5 w-3.5" />
                </span>
              ))}

            {renderLink(
              item,
              cn(
                "flex min-h-9 items-center rounded-md text-sm font-medium transition-colors duration-150",
                isOpen ? "w-full gap-3 px-3 py-2" : "mx-auto h-9 w-9 justify-center px-2 py-2",
                item.isActive
                  ? "bg-[var(--sidebar-nav-hover-background)] text-[var(--ink-primary)]"
                  : "text-[var(--ink-secondary)] hover:bg-[var(--sidebar-nav-hover-background)] hover:text-[var(--ink-primary)]",
              ),
            )}
          </div>
        );
      })}
    </div>
  );
};
