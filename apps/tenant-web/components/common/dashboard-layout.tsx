"use client";

import { DashboardShell, type DashboardSidebarRenderContext, type HeaderSearchItem } from "@pte/ui";
import type { ReactElement, ReactNode } from "react";

export type SidebarRenderContext = DashboardSidebarRenderContext;

type DashboardSlot = ReactNode | ((context: SidebarRenderContext) => ReactNode);

export interface CommonDashboardLayoutProps {
  /** Compatibility wrapper for tenant routes; rendering lives in @pte/ui. */
  brand?: DashboardSlot;
  sidebar: DashboardSlot;
  headerBrand?: ReactNode;
  headerSearch?: ReactNode;
  headerSearchItems?: readonly HeaderSearchItem[];
  headerSearchPlaceholder?: string;
  onHeaderSearchNavigate?: (url: string) => void;
  headerActions?: ReactNode;
  breadcrumbs?: ReactNode;
  footer?: ReactNode;
  navigationKey?: string | null;
  children: ReactNode;
}

export const CommonDashboardLayout = ({
  brand,
  sidebar,
  headerBrand,
  headerSearch,
  headerSearchItems,
  headerSearchPlaceholder,
  onHeaderSearchNavigate,
  headerActions,
  breadcrumbs,
  footer,
  navigationKey,
  children,
}: CommonDashboardLayoutProps): ReactElement => (
  <DashboardShell
    brand={brand}
    sidebar={sidebar}
    headerBrand={headerBrand}
    headerSearch={headerSearch}
    headerSearchItems={headerSearchItems}
    headerSearchPlaceholder={headerSearchPlaceholder}
    onHeaderSearchNavigate={onHeaderSearchNavigate}
    headerActions={headerActions}
    breadcrumbs={breadcrumbs}
    footer={footer}
    navigationKey={navigationKey}
  >
    {children}
  </DashboardShell>
);

export default CommonDashboardLayout;
