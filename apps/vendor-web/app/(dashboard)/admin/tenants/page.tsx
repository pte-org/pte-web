import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { TenantManagementView } from "@/features/tenancy/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function TenantsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <TenantManagementView />
    </DashboardChrome>
  );
}
