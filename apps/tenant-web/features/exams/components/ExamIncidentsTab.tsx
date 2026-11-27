"use client";
import type { ReactElement } from "react";
import { CollapsibleSection } from "@pte/ui";
import { IncidentListView } from "@/features/proctor/components/IncidentListView";
import { HostIncidentDetailModal } from "./HostIncidentDetailModal";
import { useIncidentText } from "@/features/proctor/hooks/useIncidentText";

interface ExamIncidentsTabProps {
  sessionPublicId: string;
}

export function ExamIncidentsTab({ sessionPublicId }: ExamIncidentsTabProps): ReactElement {
  const text = useIncidentText();
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-secondary)]">{text.hostIntro}</p>
      <CollapsibleSection title={text.hostWorkflow} defaultExpanded={false}>
        <p className="text-sm text-[var(--ink-secondary)]">{text.hostFlow}</p>
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
