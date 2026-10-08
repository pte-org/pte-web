import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AdminApplicationDetailView } from "@/features/commercialization/components";

interface AdminApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function AdminApplicationDetailPage({
  params,
}: AdminApplicationDetailPageProps) {
  const { applicationId } = await params;

  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AdminApplicationDetailView applicationId={applicationId} />
    </RequireAuth>
  );
}
