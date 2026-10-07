import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { LicenseCodesView } from "@/features/commercialization/components";

export default function AdminLicenseCodesPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <LicenseCodesView />
    </RequireAuth>
  );
}
