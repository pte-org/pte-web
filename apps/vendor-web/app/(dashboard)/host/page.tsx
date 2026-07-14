import { DashboardChrome } from "@/features/auth/components";
import { HOST_NAV } from "@/lib/navigation";

const HOST_DASHBOARD_TEXT =
  "Host workspace: manage learners and exams for your organization.";

export default function HostDashboardPage() {
  return (
    <DashboardChrome navItems={HOST_NAV}>
      <p className="text-gray-600">{HOST_DASHBOARD_TEXT}</p>
    </DashboardChrome>
  );
}
