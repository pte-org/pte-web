import { DashboardChrome } from "@/features/auth/components";
import { HostCreationForm } from "@/features/tenancy/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function HostsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <HostCreationForm />
    </DashboardChrome>
  );
}
