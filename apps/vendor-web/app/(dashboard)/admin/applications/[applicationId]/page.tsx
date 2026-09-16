import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { AdminApplicationDetailView } from "@/features/commercialization/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface AdminApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function AdminApplicationDetailPage({
  params,
}: AdminApplicationDetailPageProps) {
  const { applicationId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <AdminApplicationDetailView applicationId={applicationId} />
    </DashboardChrome>
  );
}
