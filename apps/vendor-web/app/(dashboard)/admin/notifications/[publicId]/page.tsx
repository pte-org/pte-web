import { DashboardChrome } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { NotificationDetailView } from "@/features/notifications/components/NotificationDetailView";
import { ADMIN_NAV } from "@/lib/navigation";

export default async function AdminNotificationDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={PLATFORM_ADMIN_ONLY}>
      <NotificationDetailView publicId={publicId} />
    </DashboardChrome>
  );
}
