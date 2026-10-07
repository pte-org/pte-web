"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { LoadingState } from "@pte/ui";
import { SessionDetailView } from "@/features/exams/components";

export default function SessionDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return (
    <Suspense fallback={<LoadingState rows={4} />}>
      <SessionDetailView sessionPublicId={publicId} />
    </Suspense>
  );
}
