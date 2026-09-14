import { BuildingIcon, ClipboardIcon, GridIcon, LicenseIcon } from "@pte/ui";
import type { NavItem } from "@/features/auth/components";

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <GridIcon />, section: "Home" },
  { label: "Tenants", href: "/admin/tenants", icon: <BuildingIcon />, section: "Tenants" },
  {
    label: "Licenses",
    href: "/admin/licenses",
    icon: <LicenseIcon />,
    section: "Tenants",
  },
  {
    label: "Question Bank",
    href: "/admin/questions",
    icon: <ClipboardIcon />,
    section: "Content",
  },
  { label: "Licenses", href: "/admin/licenses", icon: <LicenseIcon />, section: "Tenants" },
];

export const HOST_NAV: NavItem[] = [
  { label: "Overview", href: "/host", icon: <GridIcon />, section: "Home" },
];
