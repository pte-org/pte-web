import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { TenantDetailView } from "@/features/tenancy/components";

interface TenantDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <TenantDetailView tenantPublicId={publicId} />
    </RequireAuth>
  );
}
