import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AdminSupportTicketDetailView } from "@/features/supportTickets/components";

interface AdminSupportTicketDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function AdminSupportTicketDetailPage({
  params,
}: AdminSupportTicketDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AdminSupportTicketDetailView ticketPublicId={publicId} />
    </RequireAuth>
  );
}
