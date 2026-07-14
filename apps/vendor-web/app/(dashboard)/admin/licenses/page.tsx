import { DashboardChrome } from "@/features/auth/components";
import { LicensingView } from "@/features/licensing/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function LicensesPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <LicensingView />
    </DashboardChrome>
  );
}
