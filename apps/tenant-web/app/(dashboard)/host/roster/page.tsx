import { DashboardChrome, type NavItem } from "@/features/auth/components";
import { RosterImport } from "@/features/examoperations/components";

const HOST_NAV: NavItem[] = [
  { label: "Overview", href: "/host/dashboard" },
  { label: "Import Learners", href: "/host/roster" },
];

export default function RosterPage() {
  return (
    <DashboardChrome navItems={HOST_NAV}>
      <RosterImport />
    </DashboardChrome>
  );
}
