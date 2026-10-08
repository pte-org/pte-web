"use client";

import { RequireAuth } from "@/features/auth/components";
import { AuditLogView } from "@/features/auditLog/components";

// Backend's AuditLogController is `hasRole('HOST_ADMIN')` only — the FE gate
// mirrors that exactly rather than reusing the broader `HOST_ROLES`.
export default function AuditLogPage() {
  return (
    <RequireAuth allowedRoles={["HOST_ADMIN"]}>
      <AuditLogView />
    </RequireAuth>
  );
}
