import { AdminSupportTicketDetailView } from "@/features/supportTickets/components";

interface AdminSupportTicketDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function AdminSupportTicketDetailPage({
  params,
}: AdminSupportTicketDetailPageProps) {
  const { publicId } = await params;

  return <AdminSupportTicketDetailView ticketPublicId={publicId} />;
}
