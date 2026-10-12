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
}

const DashboardBreadcrumbContext = createContext<{
  routeLabel: RouteLabel | null;
  register: (pathname: string, label: string) => () => void;
} | null>(null);

export const DashboardBreadcrumbProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [routeLabel, setRouteLabel] = useState<RouteLabel | null>(null);
  const register = useCallback((pathname: string, label: string) => {
    const entry = { pathname, label };
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
export function useDashboardBreadcrumbLabel(pathname: string, label?: string): void {
  const register = useContext(DashboardBreadcrumbContext)?.register;
  useEffect(() => {
    if (register && label) return register(pathname, label);
  }, [register, pathname, label]);
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
  return [
    parent,
    {
      label: routeLabel?.pathname === pathname ? routeLabel.label : fallbackLabel,
    },
  ];
}
