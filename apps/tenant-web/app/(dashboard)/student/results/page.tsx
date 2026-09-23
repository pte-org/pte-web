"use client";

import { DashboardChrome } from "@/features/auth/components";
import { StudentReportsView } from "@/features/reports/StudentReportsView";
import { buildStudentNav } from "@/lib/navigation";

export default function StudentResultsPage() {
  return (
    <DashboardChrome navItems={buildStudentNav()} allowedRoles={["STUDENT"]}>
      <StudentReportsView />
    </DashboardChrome>
  );
}
