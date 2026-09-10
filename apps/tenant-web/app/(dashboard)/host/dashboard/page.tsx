"use client";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { LearnersOverview } from "@/features/examoperations/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

const HOST_DASHBOARD_TEXT =
  "Manage learners, import rosters, and assign exams for your organization.";

export default function HostDashboardPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <div className="flex flex-col gap-6">
        <p className="text-gray-600">{HOST_DASHBOARD_TEXT}</p>
        <LearnersOverview />
      </div>
    </DashboardChrome>
  );
}
