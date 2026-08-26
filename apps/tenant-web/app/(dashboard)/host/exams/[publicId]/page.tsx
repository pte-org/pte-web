import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { SessionDetailView } from "@/features/exams/components";
import { HOST_NAV } from "@/lib/navigation";

interface SessionDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={HOST_NAV} allowedRoles={HOST_ROLES}>
      <SessionDetailView sessionPublicId={publicId} />
    </DashboardChrome>
  );
}
