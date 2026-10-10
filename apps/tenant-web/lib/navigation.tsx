import type { NavItem } from "@/features/auth/components";
import type { OrgLabels } from "@/features/orgLabels/constants";
import {
  NavApplicationIcon,
  NavAuditLogIcon,
  NavBillingIcon,
  NavClassIcon,
  NavDashboardIcon,
  NavExamTemplateIcon,
  NavQuestionBankIcon,
  NavSupportTicketIcon,
  NavTaskTypeIcon,
  NavUserIcon,
  NavUserGroupIcon,
  ShieldIcon,
} from "@pte/ui";
import {
  EXAMINER_NAV_TEXT,
  HOST_NAV_TEXT as T,
  PROCTOR_NAV_TEXT,
  STUDENT_NAV_TEXT,
} from "./navigationConstants";

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
    { label: T.OVERVIEW, labelKey: "nav.overview", href: "/host/dashboard", icon: <NavDashboardIcon />, section: T.HOME_SECTION, sectionKey: "nav.home" },
    { label: T.LEARNERS, labelKey: "nav.learners", href: "/host/students", icon: <NavUserIcon />, section: T.USERS_SECTION, sectionKey: "nav.users" },
    {
      label: T.EXAM_STAFF,
      labelKey: "nav.examStaff",
      href: "/host/exam-staff",
      icon: <NavUserGroupIcon />,
      section: T.USERS_SECTION,
      sectionKey: "nav.users",
    },
    {
      label: labels.program,
      href: "/host/programs",
      icon: <NavQuestionBankIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
    },
    {
      label: labels.class,
      href: "/host/classes",
      icon: <NavClassIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
    },
    { label: T.EXAMS, labelKey: "nav.exams", href: "/host/exams", icon: <NavExamTemplateIcon />, section: T.DELIVERY_SECTION, sectionKey: "nav.delivery" },
    {
      label: T.PLANS_AND_BILLING,
      labelKey: "nav.plansBilling",
      href: "/host/billing",
      icon: <NavBillingIcon />,
      section: T.ACCOUNT_SECTION,
      sectionKey: "nav.account",
      requiredRoles: ["HOST_ADMIN"],
    },
    {
      label: T.AUDIT_LOG,
      labelKey: "nav.auditLog",
      href: "/host/audit-log",
      icon: <NavAuditLogIcon />,
      section: T.DATA_SECTION,
      sectionKey: "nav.data",
      requiredRoles: ["HOST_ADMIN"],
    },
    {
      label: T.SUPPORT_TICKETS,
      labelKey: "nav.supportTickets",
      href: "/host/support-tickets",
      icon: <NavSupportTicketIcon />,
      section: T.DATA_SECTION,
      sectionKey: "nav.data",
      requiredRoles: ["HOST_ADMIN"],
    },
  ];
}

/** Examiner navigation is intentionally isolated from all Host-only destinations. */
export function buildExaminerNav(): NavItem[] {
  return [
    {
      label: EXAMINER_NAV_TEXT.QUEUE,
      labelKey: "nav.markingQueue",
      href: "/examiner/work",
      icon: <NavTaskTypeIcon />,
      section: EXAMINER_NAV_TEXT.SECTION,
      sectionKey: "nav.examiner",
    },
  ];
}

export function buildStudentNav(): NavItem[] {
  return [
    {
      label: STUDENT_NAV_TEXT.RESULTS,
      labelKey: "nav.myResults",
      href: "/student/results",
      icon: <NavApplicationIcon />,
      section: STUDENT_NAV_TEXT.SECTION,
      sectionKey: "nav.student",
    },
  ];
}

/**
 * Proctor navigation. PROCTOR accounts land in the proctor console
 * (proctor is a monitoring role, not a host tenant-admin). Audit-log
 * list at `/proctor/audit-log` is out of scope this phase; pro enters
 * post-hoc review per-session via deep-link from
 * `/proctor/sessions/{publicId}` (the live monitoring view).
 */
export function buildProctorNav(): NavItem[] {
  return [
    {
      label: PROCTOR_NAV_TEXT.PROFILE,
      href: "/proctor/profile",
      icon: <ShieldIcon />,
      section: PROCTOR_NAV_TEXT.SECTION,
    },
  ];
}
