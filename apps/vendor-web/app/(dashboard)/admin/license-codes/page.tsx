import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { LicenseCodesView } from "@/features/commercialization/components";

export default function AdminLicenseCodesPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <LicenseCodesView />
    </RequireAuth>
  );
}
