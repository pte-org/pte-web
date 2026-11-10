"use client";
import { useMemo } from "react";
import { Badge, StatusBadge, type DataTableColumn } from "@pte/ui";
import { INCIDENT_POPUP_TEXT, incidentRoleLabel } from "../incidentPresentation";
import type { IncidentResponse } from "@pte/api-client";
import {
  getIncidentSeverityBadge as getSeverityBadge,
  getIncidentStatusBadge as getStatusBadge,
  PROCTOR_INCIDENT_LIST_TEXT as T,
  PROCTOR_INCIDENT_CATEGORY_OPTIONS,
} from "../constants";
export const useIncidentColumns = (): DataTableColumn<IncidentResponse>[] => {
  return useMemo(
    () => [
      {
        key: "title",
        header: T.COL_TITLE_CATEGORY,
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">{row.title}</div>
            <div className="text-xs text-[var(--ink-muted)]">
              #{row.incidentPublicId.slice(0, 8).toUpperCase()} •{" "}
              {PROCTOR_INCIDENT_CATEGORY_OPTIONS.find((option) => option.value === row.category)
                ?.label ?? row.category}
            </div>
          </div>
        ),
      },
      {
        key: "student",
        header: T.COL_STUDENT,
        cell: (row) =>
          row.studentName || row.studentPublicId ? (
            <div>
              <div className="font-medium text-xs text-[var(--ink-primary)]">
                {row.studentName || T.STUDENT_FALLBACK}
              </div>
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">{T.ALL_SESSION_SCOPE}</span>
          ),
      },
      {
        key: "severity",
        header: T.COL_SEVERITY,
        cell: (row) => {
          const { variant } = getSeverityBadge(row.severity);
          return <Badge variant={variant}>{INCIDENT_POPUP_TEXT.SEVERITY[row.severity]}</Badge>;
        },
      },
      {
        key: "status",
        header: T.COL_STATUS,
        cell: (row) => {
          const { label, variant } = getStatusBadge(row.status);
          return <StatusBadge label={label} variant={variant} />;
        },
      },
      {
        key: "owner",
        header: T.COL_OWNER,
        cell: (row) => (
          <div>
            <span className="text-xs font-medium text-[var(--ink-primary)]">
              {incidentRoleLabel(row.currentOwnerRole)}
            </span>
            {row.currentOwnerName && (
              <div className="text-[11px] text-[var(--ink-muted)]">{row.currentOwnerName}</div>
            )}
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: T.COL_UPDATED,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {new Date(row.updatedAt).toLocaleString("vi-VN")}
          </span>
        ),
      },
    ],
    [],
  );
};
