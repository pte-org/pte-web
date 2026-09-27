"use client";

import { DashboardChrome } from "@/features/auth/components";
import { ExaminerWorkView } from "@/features/examiner/ExaminerWorkView";
import { buildExaminerNav } from "@/lib/navigation";

export default function ExaminerWorkPage() {
  return (
    <DashboardChrome navItems={buildExaminerNav()} allowedRoles={["EXAMINER"]}>
      <ExaminerWorkView />
    </DashboardChrome>
  );
}
