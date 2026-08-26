import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { TenantDetailView } from "@/features/tenancy/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface TenantDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <TenantDetailView tenantPublicId={publicId} />
    </DashboardChrome>
  );
}
