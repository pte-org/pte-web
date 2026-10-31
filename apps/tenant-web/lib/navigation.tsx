import type { NavItem } from "@/features/auth/components";
import type { OrgLabels } from "@/features/orgLabels/constants";
import {
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
} from "./navigationConstants";

/**
 * Non-label entries stay static; the Program entry's label is org-type-driven.
 * "System log" carries `requiredRoles: ["HOST_ADMIN"]` — its page is gated
 * `HOST_ADMIN`-only (mirroring the backend's `AuditLogController`), so
 * without this a non-administrator tenant role would see the link, click it, and be
 * silently bounced to the login screen by `RequireAuth` (which has no
 * distinct "insufficient permissions" state) — `DashboardChrome`'s
 * `SidebarNav` filters on this field so that link never renders for them.
 */
export function buildHostNav(labels: OrgLabels): NavItem[] {
  return [
    {
      label: T.OVERVIEW,
      labelKey: "nav.overview",
      href: "/host/dashboard",
      icon: <NavDashboardIcon />,
      section: T.HOME_SECTION,
      sectionKey: "nav.home",
    },
    {
      label: T.LEARNERS,
      labelKey: "nav.learners",
      href: "/host/students",
      icon: <NavUserIcon />,
      section: T.USERS_SECTION,
      sectionKey: "nav.users",
    },
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
      labelKey: "nav.program",
      href: "/host/programs",
      icon: <NavQuestionBankIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
    },
    {
      label: labels.class,
      labelKey: "nav.class",
      href: "/host/classes",
      icon: <NavClassIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
    },
    {
      label: T.EXAMS,
      labelKey: "nav.exams",
      href: "/host/exams",
      icon: <NavExamTemplateIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
    },
    {
      label: T.EXAM_TEMPLATES,
      labelKey: "nav.hostTemplates",
      href: "/host/exam-templates",
      icon: <NavTaskTypeIcon />,
      section: T.DELIVERY_SECTION,
      sectionKey: "nav.delivery",
      requiredRoles: ["HOST_ADMIN"],
    },
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
      label: T.SUPPORT_TICKETS,
      labelKey: "nav.supportTickets",
      href: "/host/support-tickets",
      icon: <NavSupportTicketIcon />,
      section: T.DATA_SECTION,
      sectionKey: "nav.data",
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
  ];
}

/** Examiner navigation: Overview, the marking queue (status is filtered in-page) and reports. */
export function buildExaminerNav(): NavItem[] {
  return [
    {
      label: EXAMINER_NAV_TEXT.OVERVIEW,
      labelKey: "nav.examinerOverview",
      href: "/examiner/work",
      icon: <NavDashboardIcon />,
      section: EXAMINER_NAV_TEXT.HOME_SECTION,
      sectionKey: "nav.home",
    },
    {
      label: EXAMINER_NAV_TEXT.QUEUE,
      labelKey: "nav.markingQueue",
      href: "/examiner/work?status=ALL",
      icon: <NavTaskTypeIcon />,
      section: EXAMINER_NAV_TEXT.QUEUE_SECTION,
      sectionKey: "nav.markingQueue",
    },
    {
      label: EXAMINER_NAV_TEXT.REPORTS,
      labelKey: "nav.examinerReports",
      href: "/examiner/reports",
      icon: <NavAuditLogIcon />,
      section: EXAMINER_NAV_TEXT.REPORTS_SECTION,
      sectionKey: "nav.reports",
    },
  ];
}

/**
 * Proctor navigation. PROCTOR accounts land in the proctor console
 * with overview, accessible monitoring, attendance picker, and audit log picker.
 */
export function buildProctorNav(): NavItem[] {
  return [
    {
      label: PROCTOR_NAV_TEXT.OVERVIEW,
      labelKey: "nav.proctorOverview",
      href: "/proctor/sessions",
      icon: <NavDashboardIcon />,
      section: PROCTOR_NAV_TEXT.HOME_SECTION,
      sectionKey: "nav.home",
    },
    {
      label: PROCTOR_NAV_TEXT.MONITORING,
      labelKey: "nav.proctorMonitoring",
      href: "/proctor/sessions?scope=ACCESSIBLE",
      icon: <NavExamTemplateIcon />,
      section: PROCTOR_NAV_TEXT.SUPERVISION_SECTION,
      sectionKey: "nav.supervision",
    },
    {
      label: PROCTOR_NAV_TEXT.ATTENDANCE,
      labelKey: "nav.proctorAttendance",
      href: "/proctor/attendance",
      icon: <NavUserGroupIcon />,
      section: PROCTOR_NAV_TEXT.SUPERVISION_SECTION,
      sectionKey: "nav.supervision",
    },
    {
      label: PROCTOR_NAV_TEXT.INCIDENTS,
      labelKey: "nav.proctorIncidents",
      href: "/proctor/incidents",
      icon: <NavSupportTicketIcon />,
      section: PROCTOR_NAV_TEXT.SUPERVISION_SECTION,
      sectionKey: "nav.supervision",
    },
    {
      label: PROCTOR_NAV_TEXT.AUDIT_LOG,
      labelKey: "nav.proctorAuditLog",
      href: "/proctor/audit-log",
      icon: <NavAuditLogIcon />,
      section: PROCTOR_NAV_TEXT.DATA_SECTION,
      sectionKey: "nav.data",
    },
    {
      label: PROCTOR_NAV_TEXT.PROFILE,
      labelKey: "nav.proctorProfile",
      href: "/proctor/profile",
      icon: <ShieldIcon />,
      section: PROCTOR_NAV_TEXT.ACCOUNT_SECTION,
      sectionKey: "nav.account",
    },
  ];
}
