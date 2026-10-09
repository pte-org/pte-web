"use client";

import { useParams } from "next/navigation";

import { NotificationDetailView } from "@/features/notifications/components/NotificationDetailView";

export default function HostNotificationDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return (
    <NotificationDetailView publicId={publicId} />
  );
}
