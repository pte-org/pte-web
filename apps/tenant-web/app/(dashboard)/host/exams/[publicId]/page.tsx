"use client";

import { useParams } from "next/navigation";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { SessionDetailView } from "@/features/exams/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function SessionDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <SessionDetailView sessionPublicId={publicId} />
    </DashboardChrome>
  );
}
