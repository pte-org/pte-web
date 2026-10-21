"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute, useSessionManager, type SessionRole } from "@pte/ui";
import { AUTH_ROUTES } from "../constants";
import { AuthLoading } from "./AuthLoading";

/** Waits for token hydration before deciding — delegates authorized/redirect logic to `@pte/ui`'s ProtectedRoute, wired to Next's router. */
export const RequireAuth = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: SessionRole[];
}): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isReady, hasRole } = useSessionManager();
  const mustChangePassword = Boolean(session?.mustChangePassword)
    && pathname !== AUTH_ROUTES.changePassword;

  useEffect(() => {
    if (isReady && mustChangePassword) {
      router.replace(AUTH_ROUTES.changePassword);
    }
  }, [isReady, mustChangePassword, router]);

  if (!isReady) return <AuthLoading />;
  if (mustChangePassword) return <AuthLoading />;

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
