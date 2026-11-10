"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { BreadcrumbItem } from "../components/Breadcrumbs";

interface RouteLabel {
  pathname: string;
  label: string;
  /** Levels between the section and this page, e.g. the version a task type was opened from. */
  trail: readonly BreadcrumbItem[];
}

const DashboardBreadcrumbContext = createContext<{
  routeLabel: RouteLabel | null;
  register: (pathname: string, label: string, trail: readonly BreadcrumbItem[]) => () => void;
} | null>(null);

export const DashboardBreadcrumbProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [routeLabel, setRouteLabel] = useState<RouteLabel | null>(null);
  const register = useCallback((pathname: string, label: string, trail: readonly BreadcrumbItem[]) => {
    const entry = { pathname, label, trail };
    setRouteLabel(entry);
    return () => setRouteLabel((current) => (current === entry ? null : current));
  }, []);
  const value = useMemo(() => ({ routeLabel, register }), [routeLabel, register]);
  return (
    <DashboardBreadcrumbContext.Provider value={value}>
      {children}
    </DashboardBreadcrumbContext.Provider>
  );
};

/** Pages supply their already-loaded record name; the shell never fetches feature data. */
export function useDashboardBreadcrumbLabel(
  pathname: string,
  label?: string,
  trail?: readonly BreadcrumbItem[],
): void {
  const register = useContext(DashboardBreadcrumbContext)?.register;
  // The trail is compared by content, so a page may pass a new array on every render.
  const trailKey = JSON.stringify(trail ?? []);
  useEffect(() => {
    if (register && label) return register(pathname, label, JSON.parse(trailKey) as BreadcrumbItem[]);
  }, [register, pathname, label, trailKey]);
}

export function useDashboardBreadcrumbItems(
  pathname: string | null,
  parent: BreadcrumbItem | undefined,
  fallbackLabel: string,
): BreadcrumbItem[] {
  const routeLabel = useContext(DashboardBreadcrumbContext)?.routeLabel;
  const currentPath = pathname?.replace(/\/$/, "");
  const parentPath = parent?.href?.replace(/\/$/, "");
  // Sidebar destinations already identify top-level pages: no Home or single-item trail.
  if (!currentPath || !parent || !parentPath || currentPath === parentPath) return [];
  const current = routeLabel?.pathname === pathname ? routeLabel : null;
  return [parent, ...(current?.trail ?? []), { label: current?.label ?? fallbackLabel }];
}
