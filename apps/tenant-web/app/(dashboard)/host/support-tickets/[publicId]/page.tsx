"use client";

import { useParams } from "next/navigation";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { SupportTicketDetailView } from "@/features/supportTickets/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function SupportTicketDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <SupportTicketDetailView ticketPublicId={publicId} />
    </DashboardChrome>
  );
}
