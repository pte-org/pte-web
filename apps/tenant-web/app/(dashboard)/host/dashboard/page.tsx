"use client";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { LearnersOverview } from "@/features/examoperations/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";
import { PageHeader } from "@pte/ui";

const HOST_DASHBOARD_TEXT = {
  TITLE: "Overview",
  SUBTITLE: "Manage learners, import rosters, and assign exams for your organization.",
} as const;

export default function HostDashboardPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <div className="flex flex-col gap-6">
        <PageHeader title={HOST_DASHBOARD_TEXT.TITLE} subtitle={HOST_DASHBOARD_TEXT.SUBTITLE} />
        <LearnersOverview />
      </div>
    </DashboardChrome>
  );
}
