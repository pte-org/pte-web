import type { ReactNode } from "react";
import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      {children}
    </DashboardChrome>
  );
}
