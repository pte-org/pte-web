import type { ReactElement, ReactNode } from "react";
import { TenantDashboardLayoutChrome } from "@/features/auth/components";
import { ProctorSessionWorkspace } from "@/features/proctor/components/ProctorSessionWorkspace";

/** Proctor workspace layout. */
export default function ProctorLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <TenantDashboardLayoutChrome area="proctor"><ProctorSessionWorkspace>{children}</ProctorSessionWorkspace></TenantDashboardLayoutChrome>;
}
