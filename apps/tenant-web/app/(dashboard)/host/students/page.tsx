"use client";

import { Suspense } from "react";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { StudentSearchView } from "@/features/studentSearch/components";
import { LoadingState } from "@pte/ui";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function StudentsPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <Suspense fallback={<LoadingState rows={8} />}>
        <StudentSearchView />
      </Suspense>
    </DashboardChrome>
  );
}
