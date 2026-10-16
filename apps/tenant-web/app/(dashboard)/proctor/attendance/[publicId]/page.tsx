"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { ProctorAttendanceView } from "@/features/proctor/components/ProctorAttendanceView";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export default function ProctorAttendanceDetailPage({ params }: PageProps): ReactElement {
  const { publicId } = use(params);
  return <ProctorAttendanceView sessionPublicId={publicId} />;
}
