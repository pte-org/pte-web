"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { ProgramDetailView } from "@/features/programs/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function ProgramDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const organizationPublicId = useSearchParams().get("organizationPublicId") ?? "";
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <ProgramDetailView organizationPublicId={organizationPublicId} programPublicId={publicId} />
    </DashboardChrome>
  );
}
