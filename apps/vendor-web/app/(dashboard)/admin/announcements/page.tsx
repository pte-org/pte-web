import { DashboardChrome } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { AnnouncementsView } from "@/features/notifications/components/AnnouncementsView";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminAnnouncementsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={PLATFORM_ADMIN_ONLY}>
      <AnnouncementsView />
    </DashboardChrome>
  );
}
