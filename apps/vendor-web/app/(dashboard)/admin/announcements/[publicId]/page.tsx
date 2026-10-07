import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { AnnouncementDetailView } from "@/features/notifications/components/AnnouncementDetailView";

export default async function AdminAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <AnnouncementDetailView publicId={publicId} />
    </RequireAuth>
  );
}
