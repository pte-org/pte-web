import type { NavItem } from "@/features/auth/components";
import type { OrgLabels } from "@/features/orgLabels/constants";

/**
 * Non-label entries stay static; the Program entry's label is org-type-driven.
 * "Audit Log" carries `requiredRoles: ["HOST_ADMIN"]` — its page is gated
 * `HOST_ADMIN`-only (mirroring the backend's `AuditLogController`), so
 * without this a `HOST_AUTHOR` would see the link, click it, and be
 * silently bounced to the login screen by `RequireAuth` (which has no
 * distinct "insufficient permissions" state) — `DashboardChrome`'s
 * `SidebarNav` filters on this field so that link never renders for them.
 */
export function buildHostNav(labels: OrgLabels): NavItem[] {
  return [
    { label: "Overview", href: "/host/dashboard" },
    { label: "Exams", href: "/host/exams" },
    { label: labels.program, href: "/host/programs" },
    { label: "Students", href: "/host/students" },
    { label: "Audit Log", href: "/host/audit-log", requiredRoles: ["HOST_ADMIN"] },
  ];
}
