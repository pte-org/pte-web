import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { OverviewView } from "@/features/dashboard/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminDashboardPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <OverviewView />
    </DashboardChrome>
  );
}
