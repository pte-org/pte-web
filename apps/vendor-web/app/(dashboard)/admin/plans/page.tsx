import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { PlanCatalogView } from "@/features/commercialization/components";

export default function AdminPlansPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <PlanCatalogView />
    </RequireAuth>
  );
}
