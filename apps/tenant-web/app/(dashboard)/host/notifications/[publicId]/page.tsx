"use client";

import { useParams } from "next/navigation";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { NotificationDetailView } from "@/features/notifications/components/NotificationDetailView";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function HostNotificationDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const labels = useOrgLabels();
  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <NotificationDetailView publicId={publicId} />
    </DashboardChrome>
  );
}
