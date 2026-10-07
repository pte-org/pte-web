import { TenantDetailView } from "@/features/tenancy/components";

interface TenantDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { publicId } = await params;

  return <TenantDetailView tenantPublicId={publicId} />;
}
