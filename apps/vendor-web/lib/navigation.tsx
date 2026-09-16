import { BuildingIcon, ClipboardIcon, DocumentIcon, GridIcon, LicenseIcon } from "@pte/ui";
import type { NavItem } from "@/features/auth/components";

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <GridIcon />, section: "Home" },
  { label: "Tenants", href: "/admin/tenants", icon: <BuildingIcon />, section: "Tenants" },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: <DocumentIcon />,
    section: "Tenants",
  },
  {
    label: "Licenses",
    href: "/admin/licenses",
    icon: <LicenseIcon />,
    section: "Tenants",
  },
  { label: "Plan catalog", href: "/admin/plans", icon: <LicenseIcon />, section: "Commercial" },
  {
    label: "License codes",
    href: "/admin/license-codes",
    icon: <LicenseIcon />,
    section: "Commercial",
  },
  {
    label: "Platform settings",
    href: "/admin/settings",
    icon: <DocumentIcon />,
    section: "Commercial",
  },
  {
    label: "Question Bank",
    href: "/admin/questions",
    icon: <ClipboardIcon />,
    section: "Content",
  },
  { label: "Exam Blueprints", href: "/admin/exams", icon: <ClipboardIcon />, section: "Content" },
];

export const HOST_NAV: NavItem[] = [
  { label: "Overview", href: "/host", icon: <GridIcon />, section: "Home" },
];
