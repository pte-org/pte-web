import { DashboardChrome } from "@/features/auth/components";
import { TenantManagementView } from "@/features/tenancy/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function TenantsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <TenantManagementView />
    </DashboardChrome>
  );
}
