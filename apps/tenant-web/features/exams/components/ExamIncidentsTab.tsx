"use client";
import type { ReactElement } from "react";
import { CollapsibleSection } from "@pte/ui";
import { IncidentListView } from "@/features/proctor/components/IncidentListView";
import { HostIncidentDetailModal } from "./HostIncidentDetailModal";
import { HOST_INCIDENT_TEXT as T } from "../constants/incidents";

interface ExamIncidentsTabProps {
  sessionPublicId: string;
}

export function ExamIncidentsTab({ sessionPublicId }: ExamIncidentsTabProps): ReactElement {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-secondary)]">{T.INTRO}</p>
      <CollapsibleSection title={T.WORKFLOW} defaultExpanded={false}>
        <p className="text-sm text-[var(--ink-secondary)]">{T.FLOW}</p>
      </CollapsibleSection>
      <IncidentListView
        sessionPublicId={sessionPublicId}
        audience="host"
        renderDetail={(incidentPublicId, onClose) => (
          <HostIncidentDetailModal
            key={incidentPublicId}
            sessionPublicId={sessionPublicId}
            incidentPublicId={incidentPublicId}
            onClose={onClose}
          />
        )}
      />
    </div>
  );
}
