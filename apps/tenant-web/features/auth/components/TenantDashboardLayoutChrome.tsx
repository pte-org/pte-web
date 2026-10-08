"use client";

import type { ReactElement, ReactNode } from "react";
import { HOST_ROLES } from "../constants";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildExaminerNav, buildHostNav, buildStudentNav } from "@/lib/navigation";
import { DashboardChrome } from "./DashboardChrome";

export type TenantDashboardArea = "host" | "examiner" | "student";

interface TenantDashboardLayoutChromeProps {
  area: TenantDashboardArea;
  children: ReactNode;
}

const HostDashboardChrome = ({ children }: { children: ReactNode }): ReactElement => {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      {children}
    </DashboardChrome>
  );
};

const ExaminerDashboardChrome = ({ children }: { children: ReactNode }): ReactElement => (
  <DashboardChrome navItems={buildExaminerNav()} allowedRoles={["EXAMINER"]}>
    {children}
  </DashboardChrome>
);

const StudentDashboardChrome = ({ children }: { children: ReactNode }): ReactElement => (
  <DashboardChrome navItems={buildStudentNav()} allowedRoles={["STUDENT"]}>
    {children}
  </DashboardChrome>
);

export const TenantDashboardLayoutChrome = ({
  area,
  children,
}: TenantDashboardLayoutChromeProps): ReactElement => {
  if (area === "host") return <HostDashboardChrome>{children}</HostDashboardChrome>;
  if (area === "examiner") return <ExaminerDashboardChrome>{children}</ExaminerDashboardChrome>;
  return <StudentDashboardChrome>{children}</StudentDashboardChrome>;
};
