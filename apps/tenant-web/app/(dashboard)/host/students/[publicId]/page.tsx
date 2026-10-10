"use client";

import { useParams } from "next/navigation";
import { StudentDetailView } from "@/features/studentDetail";

export default function StudentDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return <StudentDetailView studentPublicId={publicId} />;
}
