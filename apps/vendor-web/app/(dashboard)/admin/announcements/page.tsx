import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AnnouncementsView } from "@/features/notifications/components/AnnouncementsView";

export default function AdminAnnouncementsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AnnouncementsView />
    </RequireAuth>
  );
}
