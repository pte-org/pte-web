import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { AnnouncementsView } from "@/features/notifications/components/AnnouncementsView";

export default function AdminAnnouncementsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <AnnouncementsView />
    </RequireAuth>
  );
}
