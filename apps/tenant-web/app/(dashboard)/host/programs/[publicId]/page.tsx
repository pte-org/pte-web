"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ProgramDetailView } from "@/features/programs/components";

export default function ProgramDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const organizationPublicId = useSearchParams().get("organizationPublicId") ?? "";
  return <ProgramDetailView organizationPublicId={organizationPublicId} programPublicId={publicId} />;
}
