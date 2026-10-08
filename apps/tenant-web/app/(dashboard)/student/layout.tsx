import type { ReactNode } from "react";
import { TenantDashboardLayoutChrome } from "@/features/auth/components";

export default function StudentLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <TenantDashboardLayoutChrome area="student">{children}</TenantDashboardLayoutChrome>;
}
