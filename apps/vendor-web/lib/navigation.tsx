import {
  BuildingIcon,
  ClipboardIcon,
  GridIcon,
  LicenseIcon,
} from "@aptis/ui";
import type { NavItem } from "@/features/auth/components";

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <GridIcon /> },
  { label: "Tenants", href: "/admin/tenants", icon: <BuildingIcon /> },
  {
    label: "Question Bank",
    href: "/admin/questions",
    icon: <ClipboardIcon />,
  },
  { label: "Licenses", href: "/admin/licenses", icon: <LicenseIcon /> },
];

export const HOST_NAV: NavItem[] = [
  { label: "Overview", href: "/host", icon: <GridIcon /> },
];
