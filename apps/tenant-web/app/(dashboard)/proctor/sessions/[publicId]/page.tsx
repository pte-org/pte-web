"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { LiveMonitoringView } from "@/features/proctor/components/LiveMonitoringView";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export default function ProctorSessionDetailPage({ params }: PageProps): ReactElement {
  const { publicId } = use(params);
  return <LiveMonitoringView sessionPublicId={publicId} />;
}