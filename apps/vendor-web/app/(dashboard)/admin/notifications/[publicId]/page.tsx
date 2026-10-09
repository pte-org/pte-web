import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { NotificationDetailView } from "@/features/notifications/components/NotificationDetailView";

export default async function AdminNotificationDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <NotificationDetailView publicId={publicId} />
    </RequireAuth>
  );
}
