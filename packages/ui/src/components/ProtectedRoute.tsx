"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isAuthorized?: boolean;
  /** Invoked in an effect when unauthenticated. */
  onUnauthenticated: () => void;
  /** Invoked in an effect when authenticated but not allowed. */
  onUnauthorized?: () => void;
  /** Shown while unauthenticated or unauthorized. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Headless auth gate. Apps own redirects so this package stays framework-light.
 */
export const ProtectedRoute = ({
  isAuthenticated,
  isAuthorized = true,
  onUnauthenticated,
  onUnauthorized,
  fallback = null,
  children,
}: ProtectedRouteProps): ReactElement => {
  useEffect(() => {
    if (!isAuthenticated) {
      onUnauthenticated();
      return;
    }
    if (!isAuthorized) onUnauthorized?.();
  }, [isAuthenticated, isAuthorized, onUnauthenticated, onUnauthorized]);

  return <>{isAuthenticated && isAuthorized ? children : fallback}</>;
};
