import { BuildingIcon, ClipboardIcon, DocumentIcon, GridIcon, LicenseIcon } from "@pte/ui";
import type { NavItem } from "@/features/auth/components";
import { ADMIN_NAV_TEXT as T } from "./navigationConstants";

export const ADMIN_NAV: NavItem[] = [
  { label: T.OVERVIEW, href: "/admin", icon: <GridIcon />, section: T.HOME_SECTION },
  { label: T.TENANTS, href: "/admin/tenants", icon: <BuildingIcon />, section: T.TENANTS_SECTION },
  {
    label: T.APPLICATIONS,
    href: "/admin/applications",
    icon: <DocumentIcon />,
    section: T.TENANTS_SECTION,
  },
  { label: T.PLAN_CATALOG, href: "/admin/plans", icon: <LicenseIcon />, section: T.COMMERCIAL_SECTION },
  {
    label: T.LICENSE_CODES,
    href: "/admin/license-codes",
    icon: <LicenseIcon />,
    section: T.COMMERCIAL_SECTION,
  },
  {
    label: T.PLATFORM_SETTINGS,
    href: "/admin/settings",
    icon: <DocumentIcon />,
    section: T.COMMERCIAL_SECTION,
  },
  {
    label: T.QUESTION_BANK,
    href: "/admin/questions",
    icon: <ClipboardIcon />,
    section: T.CONTENT_SECTION,
  },
  {
    label: T.QUESTION_TYPES,
    href: "/admin/question-types",
    icon: <DocumentIcon />,
    section: T.CONTENT_SECTION,
  },
  {
    label: T.QUESTION_TEMPLATES,
    href: "/admin/question-template",
    icon: <DocumentIcon />,
    section: T.CONTENT_SECTION,
  },
];

export const HOST_NAV: NavItem[] = [
  { label: T.OVERVIEW, href: "/host", icon: <GridIcon />, section: T.HOME_SECTION },
];
