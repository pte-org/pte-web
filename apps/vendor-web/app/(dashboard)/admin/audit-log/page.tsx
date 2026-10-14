import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { PlatformAuditLogView } from "@/features/auditLog/components";

export default function PlatformAuditLogPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <PlatformAuditLogView />
    </RequireAuth>
  );
}
