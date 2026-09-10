"use client";

import { DashboardChrome } from "@/features/auth/components";
import { AuditLogView } from "@/features/auditLog/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

// Backend's AuditLogController is `hasRole('HOST_ADMIN')` only (not HOST_AUTHOR) — the FE gate
// mirrors that exactly rather than reusing the broader `HOST_ROLES`.
export default function AuditLogPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={["HOST_ADMIN"]}>
      <AuditLogView />
    </DashboardChrome>
  );
}
