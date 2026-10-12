"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { IncidentDetailView } from "@/features/proctor/components/IncidentDetailView";

interface PageProps {
  params: Promise<{ publicId: string; incidentId: string }>;
}

export default function ProctorIncidentDetailPage({ params }: PageProps): ReactElement {
  const { publicId, incidentId } = use(params);
  return (
    <IncidentDetailView
      sessionPublicId={publicId}
      incidentPublicId={incidentId}
    />
  );
}
