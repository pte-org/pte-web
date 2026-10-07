"use client";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { NotificationHistoryView } from "@/features/notifications/components/NotificationHistoryView";
import { buildHostNav } from "@/lib/navigation";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";

export default function HostNotificationsPage() {
  const labels = useOrgLabels();
  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <NotificationHistoryView />
    </DashboardChrome>
  );
}
