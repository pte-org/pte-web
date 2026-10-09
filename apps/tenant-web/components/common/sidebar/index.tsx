"use client";

import {
  DashboardSidebar,
  type DashboardSidebarRenderContext,
} from "@pte/ui";
import type { ReactNode } from "react";

export interface SidebarRenderContext {
  isSidebarOpen: boolean;
  isMobileSheet: boolean;
  onItemClick?: () => void;
}

type SidebarSlot = ReactNode | ((context: SidebarRenderContext) => ReactNode);

const toLocalContext = (
  context: DashboardSidebarRenderContext,
): SidebarRenderContext => ({
  isSidebarOpen: context.isSidebarOpen,
  isMobileSheet: context.isMobile,
  onItemClick: context.onItemClick,
});

const renderSlot = (
  slot: SidebarSlot | undefined,
  context: DashboardSidebarRenderContext,
): ReactNode =>
  typeof slot === "function" ? slot(toLocalContext(context)) : slot;

/** Compatibility entry point; the actual sidebar UI lives in @pte/ui. */
export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isMobileSheet = false,
  onItemClick,
  brand,
  children,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileSheet?: boolean;
  onItemClick?: () => void;
  brand?: SidebarSlot;
  children?: SidebarSlot;
}) {
  return (
    <DashboardSidebar
      isMobile={isMobileSheet}
      isCollapsed={!isSidebarOpen}
      onToggle={toggleSidebar}
      onItemClick={onItemClick}
      brand={(context) => renderSlot(brand, context)}
    >
      {(context) => renderSlot(children, context)}
    </DashboardSidebar>
  );
}
