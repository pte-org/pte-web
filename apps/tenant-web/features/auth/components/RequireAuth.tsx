"use client";

import type { ReactElement, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute, useSessionManager, type SessionRole } from "@aptis/ui";
import { AUTH_ROUTES } from "../constants";
import { AuthLoading } from "./AuthLoading";

/**
 * App-side auth gate: waits for the token to hydrate (isReady) before deciding,
 * then delegates the authenticated/redirect logic to the headless
 * ProtectedRoute from @aptis/ui, wiring the redirect to Next's router.
 */
export const RequireAuth = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: SessionRole[];
}): ReactElement => {
  const router = useRouter();
  const { session, isReady, hasRole } = useSessionManager();

  if (!isReady) return <AuthLoading />;

  return (
    <ProtectedRoute
      isAuthenticated={Boolean(session?.accessToken)}
      isAuthorized={allowedRoles ? hasRole(allowedRoles) : true}
      onUnauthenticated={() => router.replace(AUTH_ROUTES.login)}
      onUnauthorized={() => router.replace(AUTH_ROUTES.login)}
      fallback={<AuthLoading />}
    >
      {children}
    </ProtectedRoute>
  );
};
