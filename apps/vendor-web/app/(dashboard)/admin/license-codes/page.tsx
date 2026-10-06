import { DashboardChrome } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { LicenseCodesView } from "@/features/commercialization/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminLicenseCodesPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={PLATFORM_ADMIN_ONLY}>
      <LicenseCodesView />
    </DashboardChrome>
  );
}
