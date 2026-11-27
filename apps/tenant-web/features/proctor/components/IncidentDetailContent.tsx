"use client";

import type { ReactElement } from "react";
import { Badge, Chip, DescriptionList, StatusBadge } from "@pte/ui";
import type { IncidentResponse } from "@pte/api-client";
import { useIncidentText } from "../hooks/useIncidentText";

interface IncidentDetailContentProps {
  incident: IncidentResponse;
}

export function IncidentDetailContent({ incident }: IncidentDetailContentProps): ReactElement {
  const text = useIncidentText();
  const severity = text.severityBadge(incident.severity);
  const status = text.statusBadge(incident.status);
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--ink-primary)]">{incident.title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={severity.variant}>{severity.label}</Badge>
          <StatusBadge label={status.label} variant={status.variant} />
        </div>
      </div>
      <DescriptionList
        items={[
          {
            label: text.detailCategory,
            value: (
              <Chip tone="sky" className="max-w-full whitespace-normal">
                {text.categoryLabel(incident.category)}
              </Chip>
            ),
          },
          {
            label: text.detailStudent,
            value: (
              <Chip
                tone={incident.studentPublicId ? "brand" : "neutral"}
                className="max-w-full whitespace-normal"
              >
                {incident.studentName ||
                  (incident.studentPublicId ? text.detailStudentUnavailable : text.detailAllSession)}
              </Chip>
            ),
          },
          {
            label: text.detailReporter,
            value: (
              <Chip tone="neutral" className="max-w-full whitespace-normal">
                {incident.reporterName && !/^[0-9a-f-]{36}$/i.test(incident.reporterName)
                  ? incident.reporterName
                  : text.roleLabel(incident.reporterRole)}
              </Chip>
            ),
          },
          { label: text.detailReportedAt, value: text.formatDateTime(incident.createdAt) },
          {
            label: text.detailOwner,
            value: (
              <Chip tone="action" className="max-w-full whitespace-normal">
                {incident.currentOwnerName || text.roleLabel(incident.currentOwnerRole)}
              </Chip>
            ),
          },
          { label: text.detailUpdatedAt, value: text.formatDateTime(incident.updatedAt) },
        ]}
      />
    </div>
  );
}
