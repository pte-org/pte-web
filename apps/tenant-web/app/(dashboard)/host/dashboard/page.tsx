"use client";

import { LearnersOverview } from "@/features/examoperations/components";
import { PageHeader } from "@pte/ui";

const HOST_DASHBOARD_TEXT = {
  TITLE: "Overview",
  SUBTITLE: "Manage learners, import rosters, and assign exams for your organization.",
} as const;

export default function HostDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={HOST_DASHBOARD_TEXT.TITLE} subtitle={HOST_DASHBOARD_TEXT.SUBTITLE} />
      <LearnersOverview />
    </div>
  );
}
