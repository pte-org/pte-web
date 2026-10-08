"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { AuditLogView } from "@/features/proctor/components/AuditLogView";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export default function ProctorAuditLogPage({ params }: PageProps): ReactElement {
  const { publicId } = use(params);
  return <AuditLogView sessionPublicId={publicId} />;
}