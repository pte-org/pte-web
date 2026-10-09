import type { ReactNode } from "react";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { HOST_NAV } from "@/lib/navigation";

export default function HostLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashboardChrome navItems={HOST_NAV} allowedRoles={HOST_ROLES}>
      {children}
    </DashboardChrome>
  );
}
