import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { PlanCatalogView } from "@/features/commercialization/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminPlansPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <PlanCatalogView />
    </DashboardChrome>
  );
}
