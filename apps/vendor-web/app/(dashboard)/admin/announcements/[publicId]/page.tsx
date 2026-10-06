import { DashboardChrome } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { AnnouncementDetailView } from "@/features/notifications/components/AnnouncementDetailView";
import { ADMIN_NAV } from "@/lib/navigation";

export default async function AdminAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={PLATFORM_ADMIN_ONLY}>
      <AnnouncementDetailView publicId={publicId} />
    </DashboardChrome>
  );
}
