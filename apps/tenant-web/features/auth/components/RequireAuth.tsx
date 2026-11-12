"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute, signInHref, useLocale, useSessionManager, type SessionRole } from "@pte/ui";
import { AppErrorPage } from "@/lib/AppErrorPage";
import { AUTH_ROUTES } from "../constants";
import { isSigningOut } from "../signOutIntent";
import { AuthLoading } from "./AuthLoading";

/**
 * Waits for token hydration, then shows the 401 page to a signed-out visitor (with a sign-in link that
 * returns here) and the 403 page to a user without the role. Only an explicit sign-out goes straight to login.
 */
export const RequireAuth = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: SessionRole[];
}): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { session, isReady, hasRole } = useSessionManager();
  const isAuthenticated = Boolean(session?.accessToken);
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
      isAuthenticated={isAuthenticated}
      isAuthorized={allowedRoles ? hasRole(allowedRoles) : true}
      onUnauthenticated={() => {
        if (isSigningOut()) router.replace(AUTH_ROUTES.login);
      }}
      fallback={
        !isAuthenticated ? (
          isSigningOut() ? <AuthLoading /> : (
            <AppErrorPage kind="unauthorized" fullScreen
              action={{ href: signInHref(AUTH_ROUTES.login, pathname), label: t("errorPage.signIn", "Sign in") }} />
          )
        ) : (
          <AppErrorPage kind="forbidden" />
        )
      }
    >
      {children}
    </ProtectedRoute>
  );
};
