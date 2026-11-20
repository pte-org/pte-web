"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ClassStudentDetail } from "@/features/classes/components/ClassStudentDetail";

export default function ClassStudentDetailPage() {
  const { publicId: programPublicId, classPublicId, studentPublicId } = useParams<{
    publicId: string;
    classPublicId: string;
    studentPublicId: string;
  }>();
  const organizationPublicId = useSearchParams().get("organizationPublicId") ?? "";
  return (
    <ClassStudentDetail
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      classPublicId={classPublicId}
      studentPublicId={studentPublicId}
    />
  );
}
