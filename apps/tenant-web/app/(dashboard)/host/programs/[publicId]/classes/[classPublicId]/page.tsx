"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { ClassDetailView } from "@/features/classes/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function ClassDetailPage() {
  const { publicId: programPublicId, classPublicId } = useParams<{
    publicId: string;
    classPublicId: string;
  }>();
  const organizationPublicId = useSearchParams().get("organizationPublicId") ?? "";
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <ClassDetailView
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={classPublicId}
      />
    </DashboardChrome>
  );
}
