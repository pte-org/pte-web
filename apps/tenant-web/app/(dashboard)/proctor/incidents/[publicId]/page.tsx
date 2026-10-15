"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { IncidentListView } from "@/features/proctor/components/IncidentListView";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export default function ProctorIncidentsListPage({ params }: PageProps): ReactElement {
  const { publicId } = use(params);
  return <IncidentListView sessionPublicId={publicId} />;
}
