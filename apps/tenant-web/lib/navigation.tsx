import type { NavItem } from "@/features/auth/components";
import type { OrgLabels } from "@/features/orgLabels/constants";
import { BookOpenIcon, DocumentIcon, GridIcon, LicenseIcon, UsersIcon } from "@pte/ui";
import { HOST_NAV_TEXT as T } from "./navigationConstants";

/**
 * Non-label entries stay static; the Program entry's label is org-type-driven.
 * "Audit Log" carries `requiredRoles: ["HOST_ADMIN"]` — its page is gated
 * `HOST_ADMIN`-only (mirroring the backend's `AuditLogController`), so
 * without this a non-administrator tenant role would see the link, click it, and be
 * silently bounced to the login screen by `RequireAuth` (which has no
 * distinct "insufficient permissions" state) — `DashboardChrome`'s
 * `SidebarNav` filters on this field so that link never renders for them.
 */
export function buildHostNav(labels: OrgLabels): NavItem[] {
  return [
    { label: T.OVERVIEW, href: "/host/dashboard", icon: <GridIcon />, section: T.HOME_SECTION },
    { label: T.LEARNERS, href: "/host/students", icon: <UsersIcon />, section: T.USERS_SECTION },
    { label: T.EXAM_STAFF, href: "/host/exam-staff", icon: <UsersIcon />, section: T.USERS_SECTION },
    { label: labels.program, href: "/host/programs", icon: <BookOpenIcon />, section: T.DELIVERY_SECTION },
    { label: T.EXAMS, href: "/host/exams", icon: <BookOpenIcon />, section: T.DELIVERY_SECTION },
    {
      label: T.PLANS_AND_BILLING,
      href: "/host/billing",
      icon: <LicenseIcon />,
      section: T.ACCOUNT_SECTION,
      requiredRoles: ["HOST_ADMIN"],
    },
    {
      label: T.AUDIT_LOG,
      href: "/host/audit-log",
      icon: <DocumentIcon />,
      section: T.DATA_SECTION,
      requiredRoles: ["HOST_ADMIN"],
    },
  ];
}
