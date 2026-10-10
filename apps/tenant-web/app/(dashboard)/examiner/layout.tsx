import type { ReactNode } from "react";
import { TenantDashboardLayoutChrome } from "@/features/auth/components";

export default function ExaminerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <TenantDashboardLayoutChrome area="examiner">{children}</TenantDashboardLayoutChrome>;
}
