"use client";

import { useParams } from "next/navigation";
import { SupportTicketDetailView } from "@/features/supportTickets/components";

export default function SupportTicketDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return <SupportTicketDetailView ticketPublicId={publicId} />;
}
