import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { LicensingView } from "@/features/licensing/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function LicensesPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <LicensingView />
    </DashboardChrome>
  );
}
