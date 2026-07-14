import { DashboardChrome, type NavItem } from "@/features/auth/components";
import { LearnersOverview } from "@/features/examoperations/components";

const HOST_NAV: NavItem[] = [
  { label: "Overview", href: "/host/dashboard" },
  { label: "Import Learners", href: "/host/roster" },
];

const HOST_DASHBOARD_TEXT =
  "Manage learners, import rosters, and assign exams for your organization.";

export default function HostDashboardPage() {
  return (
    <DashboardChrome navItems={HOST_NAV}>
      <div className="flex flex-col gap-6">
        <p className="text-gray-600">{HOST_DASHBOARD_TEXT}</p>
        <LearnersOverview />
      </div>
    </DashboardChrome>
  );
}
