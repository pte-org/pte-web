import type { ReactNode } from "react";
import { TenantDashboardLayoutChrome } from "@/features/auth/components";

export default function HostLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <TenantDashboardLayoutChrome area="host">{children}</TenantDashboardLayoutChrome>;
}
