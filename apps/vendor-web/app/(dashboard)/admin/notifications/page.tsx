import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { NotificationHistoryView } from "@/features/notifications/components/NotificationHistoryView";

export default function AdminNotificationsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <NotificationHistoryView />
    </RequireAuth>
  );
}
