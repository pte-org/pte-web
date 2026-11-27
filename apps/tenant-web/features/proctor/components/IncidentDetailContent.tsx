"use client";

import type { ReactElement } from "react";
import { Badge, Chip, DescriptionList, StatusBadge } from "@pte/ui";
import type { IncidentResponse } from "@pte/api-client";
import {
  getIncidentSeverityBadge,
  getIncidentStatusBadge,
  PROCTOR_INCIDENT_CATEGORY_OPTIONS,
} from "../constants";
import { INCIDENT_POPUP_TEXT as T, incidentRoleLabel } from "../incidentPresentation";

interface IncidentDetailContentProps {
  incident: IncidentResponse;
}

export function IncidentDetailContent({ incident }: IncidentDetailContentProps): ReactElement {
  const severity = getIncidentSeverityBadge(incident.severity);
  const status = getIncidentStatusBadge(incident.status);
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--ink-primary)]">{incident.title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={severity.variant}>{T.SEVERITY[incident.severity]}</Badge>
          <StatusBadge label={status.label} variant={status.variant} />
        </div>
      </div>
      <DescriptionList
        items={[
          {
            label: T.CATEGORY,
            value: (
              <Chip tone="sky" className="max-w-full whitespace-normal">
                {PROCTOR_INCIDENT_CATEGORY_OPTIONS.find(
                  (option) => option.value === incident.category,
                )?.label ?? incident.category}
              </Chip>
            ),
          },
          {
            label: T.STUDENT,
            value: (
              <Chip
                tone={incident.studentPublicId ? "brand" : "neutral"}
                className="max-w-full whitespace-normal"
              >
                {incident.studentName ||
                  (incident.studentPublicId ? T.STUDENT_UNAVAILABLE : T.ALL_SESSION)}
              </Chip>
            ),
          },
          {
            label: T.REPORTER,
            value: (
              <Chip tone="neutral" className="max-w-full whitespace-normal">
                {incident.reporterName && !/^[0-9a-f-]{36}$/i.test(incident.reporterName)
                  ? incident.reporterName
                  : incidentRoleLabel(incident.reporterRole)}
              </Chip>
            ),
          },
          { label: T.REPORTED_AT, value: new Date(incident.createdAt).toLocaleString("vi-VN") },
          {
            label: T.OWNER,
            value: (
              <Chip tone="action" className="max-w-full whitespace-normal">
                {incident.currentOwnerName || incidentRoleLabel(incident.currentOwnerRole)}
              </Chip>
            ),
          },
          { label: T.UPDATED_AT, value: new Date(incident.updatedAt).toLocaleString("vi-VN") },
        ]}
      />
    </div>
  );
}
