import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  renderLink: (item: SidebarNavItem, className: string) => ReactNode;
}

export const SidebarNav = ({
  items,
  renderLink,
}: SidebarNavProps): ReactElement => (
  <div className="flex flex-col gap-1">
    {items.map((item) =>
      renderLink(
        item,
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          item.isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        ),
      ),
    )}
  </div>
);
