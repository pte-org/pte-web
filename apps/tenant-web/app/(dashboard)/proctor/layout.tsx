import type { ReactElement, ReactNode } from "react";
import { TenantDashboardLayoutChrome } from "@/features/auth/components";

/** Proctor workspace layout. */
export default function ProctorLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <TenantDashboardLayoutChrome area="proctor">{children}</TenantDashboardLayoutChrome>;
}
