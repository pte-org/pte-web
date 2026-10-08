"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ClassDetailView } from "@/features/classes/components";

export default function ClassDetailPage() {
  const { publicId: programPublicId, classPublicId } = useParams<{
    publicId: string;
    classPublicId: string;
  }>();
  const organizationPublicId = useSearchParams().get("organizationPublicId") ?? "";
  return (
    <ClassDetailView
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      classPublicId={classPublicId}
    />
  );
}
