import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { AdminSupportTicketDetailView } from "@/features/supportTickets/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface AdminSupportTicketDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function AdminSupportTicketDetailPage({
  params,
}: AdminSupportTicketDetailPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <AdminSupportTicketDetailView ticketPublicId={publicId} />
    </DashboardChrome>
  );
}
