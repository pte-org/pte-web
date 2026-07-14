import { DashboardChrome } from "@/features/auth/components";
import { OverviewView } from "@/features/dashboard/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminDashboardPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <OverviewView />
    </DashboardChrome>
  );
}
