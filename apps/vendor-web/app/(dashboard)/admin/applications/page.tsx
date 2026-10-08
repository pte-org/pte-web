import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AdminApplicationsView } from "@/features/commercialization/components";

export default function AdminApplicationsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AdminApplicationsView />
    </RequireAuth>
  );
}
