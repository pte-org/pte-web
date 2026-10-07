"use client";

import { useParams } from "next/navigation";
import { SessionDetailView } from "@/features/exams/components";

export default function SessionDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return <SessionDetailView sessionPublicId={publicId} />;
}
