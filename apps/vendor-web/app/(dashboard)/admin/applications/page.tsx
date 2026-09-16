import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { AdminApplicationsView } from "@/features/commercialization/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminApplicationsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <AdminApplicationsView />
    </DashboardChrome>
  );
}
