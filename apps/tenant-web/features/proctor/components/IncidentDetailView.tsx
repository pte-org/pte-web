"use client";

import type { ReactElement } from "react";
import { IncidentListView } from "./IncidentListView";

interface IncidentDetailViewProps {
  sessionPublicId: string;
  incidentPublicId: string;
}

/** Keep existing incident links usable with the same popup as the list. */
export function IncidentDetailView({
  sessionPublicId,
  incidentPublicId,
}: IncidentDetailViewProps): ReactElement {
  return (
    <IncidentListView
      sessionPublicId={sessionPublicId}
      initialIncidentPublicId={incidentPublicId}
    />
  );
}
