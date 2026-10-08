import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { TenantManagementView } from "@/features/tenancy/components";

export default function TenantsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <TenantManagementView />
    </RequireAuth>
  );
}
