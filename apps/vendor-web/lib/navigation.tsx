import {
  NavAnnouncementIcon,
  NavApplicationIcon,
  NavDashboardIcon,
  NavExamTemplateIcon,
  NavLicenseCodeIcon,
  NavPlanCatalogIcon,
  NavQuestionBankIcon,
  NavSettingsIcon,
  NavSupportTicketIcon,
  NavTaskTypeIcon,
  NavTenantIcon,
} from "@pte/ui";
import type { NavItem } from "@/features/auth/components";
import { ADMIN_NAV_TEXT as T } from "./navigationConstants";

export const ADMIN_NAV: NavItem[] = [
  { label: T.OVERVIEW, labelKey: "nav.overview", href: "/admin", icon: <NavDashboardIcon />, section: T.HOME_SECTION, sectionKey: "nav.home" },
  { label: T.TENANTS, labelKey: "nav.tenants", href: "/admin/tenants", icon: <NavTenantIcon />, section: T.TENANTS_SECTION, sectionKey: "nav.tenants" },
  {
    label: T.APPLICATIONS,
    labelKey: "nav.applications",
    href: "/admin/applications",
    icon: <NavApplicationIcon />,
    section: T.TENANTS_SECTION,
    sectionKey: "nav.tenants",
  },
  {
    label: T.PLAN_CATALOG,
    labelKey: "nav.planCatalog",
    href: "/admin/plans",
    icon: <NavPlanCatalogIcon />,
    section: T.COMMERCIAL_SECTION,
    sectionKey: "nav.commercial",
  },
  {
    label: T.LICENSE_CODES,
    labelKey: "nav.licenseCodes",
    href: "/admin/license-codes",
    icon: <NavLicenseCodeIcon />,
    section: T.COMMERCIAL_SECTION,
    sectionKey: "nav.commercial",
    requiredRoles: ["PLATFORM_ADMIN"],
  },
  {
    label: T.PLATFORM_SETTINGS,
    labelKey: "nav.platformSettings",
    href: "/admin/settings",
    icon: <NavSettingsIcon />,
    section: T.COMMERCIAL_SECTION,
    sectionKey: "nav.commercial",
  },
  {
    label: T.ANNOUNCEMENTS,
    labelKey: "nav.announcements",
    href: "/admin/announcements",
    icon: <NavAnnouncementIcon />,
    section: T.COMMERCIAL_SECTION,
    sectionKey: "nav.commercial",
    requiredRoles: ["PLATFORM_ADMIN"],
  },
  {
    label: T.QUESTION_BANK,
    labelKey: "nav.questionBank",
    href: "/admin/questions",
    icon: <NavQuestionBankIcon />,
    section: T.CONTENT_SECTION,
    sectionKey: "nav.content",
  },
  {
    label: T.TASK_TYPES,
    labelKey: "nav.taskTypes",
    href: "/admin/question-types",
    icon: <NavTaskTypeIcon />,
    section: T.CONTENT_SECTION,
    sectionKey: "nav.content",
  },
  {
    label: T.EXAM_TEMPLATES,
    labelKey: "nav.examTemplates",
    href: "/admin/exam-template",
    icon: <NavExamTemplateIcon />,
    section: T.CONTENT_SECTION,
    sectionKey: "nav.content",
  },
  {
    label: T.SUPPORT_TICKETS,
    labelKey: "nav.supportTickets",
    href: "/admin/support-tickets",
    icon: <NavSupportTicketIcon />,
    section: T.SUPPORT_SECTION,
    sectionKey: "nav.support",
  },
];

export const HOST_NAV: NavItem[] = [
  { label: T.OVERVIEW, labelKey: "nav.overview", href: "/host", icon: <NavDashboardIcon />, section: T.HOME_SECTION, sectionKey: "nav.home" },
];
