import type { ReactElement, ReactNode } from "react";
import { DashboardChrome } from "@/features/auth/components";
import { PROCTOR_ROLES } from "@/features/auth/constants";
import { buildProctorNav } from "@/lib/navigation";
import { ProctorUnavailableView } from "@/features/proctor/components/ProctorUnavailableView";

/**
 * Proctor workspace layout.
 *
 * Gates the entire `/proctor/**` route segment behind the
 * `NEXT_PUBLIC_PROCTOR_UI_ENABLED` env var. When the flag is "false"
 * (default in production) every direct navigation to `/proctor/*` displays
 * `ProctorUnavailableView` without dispatching background API or socket calls.
 *
 * Set the flag to "true" in `.env.local` to opt in during development or pilot.
 */
export default function ProctorLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const isEnabled = process.env.NEXT_PUBLIC_PROCTOR_UI_ENABLED === "true";

  if (!isEnabled) {
    return (
      <DashboardChrome navItems={[]} allowedRoles={PROCTOR_ROLES}>
        <ProctorUnavailableView />
      </DashboardChrome>
    );
  }

  return (
    <DashboardChrome navItems={buildProctorNav()} allowedRoles={PROCTOR_ROLES}>
      {children}
    </DashboardChrome>
  );
}