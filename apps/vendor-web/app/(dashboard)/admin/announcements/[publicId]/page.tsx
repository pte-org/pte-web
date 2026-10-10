import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AnnouncementDetailView } from "@/features/notifications/components/AnnouncementDetailView";

export default async function AdminAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AnnouncementDetailView publicId={publicId} />
    </RequireAuth>
  );
}
