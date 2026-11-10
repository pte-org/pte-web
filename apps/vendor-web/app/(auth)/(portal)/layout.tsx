import type { ReactNode } from "react";
import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { AUTH_PORTAL_METADATA } from "@/features/auth/portalMetadata";

export const metadata = AUTH_PORTAL_METADATA;

/**
 * One frame for sign-in, forgot password and reset password. A layout is not mounted again when the visitor moves
 * between them, so the 3D artwork, the backdrop and the toolbar stay put and only the page content changes.
 */
export default function AuthPortalLayout({ children }: { children: ReactNode }) {
  return <AuthPageShell>{children}</AuthPageShell>;
}
