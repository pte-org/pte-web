import { AdminApplicationDetailView } from "@/features/commercialization/components";

interface AdminApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function AdminApplicationDetailPage({
  params,
}: AdminApplicationDetailPageProps) {
  const { applicationId } = await params;

  return <AdminApplicationDetailView applicationId={applicationId} />;
}
