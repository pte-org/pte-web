import { DashboardChrome } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { NotificationHistoryView } from "@/features/notifications/components/NotificationHistoryView";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminNotificationsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={PLATFORM_ADMIN_ONLY}>
      <NotificationHistoryView />
    </DashboardChrome>
  );
}
