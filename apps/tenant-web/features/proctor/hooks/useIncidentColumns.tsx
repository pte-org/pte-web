"use client";
import { useMemo } from "react";
import { Badge, StatusBadge, type DataTableColumn } from "@pte/ui";
import type { IncidentResponse } from "@pte/api-client";
import { useIncidentText } from "./useIncidentText";

export const useIncidentColumns = (): DataTableColumn<IncidentResponse>[] => {
  const text = useIncidentText();
  return useMemo(
    () => [
      {
        key: "title",
        header: text.colTitleCategory,
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">{row.title}</div>
            <div className="text-xs text-[var(--ink-muted)]">{text.categoryLabel(row.category)}</div>
          </div>
        ),
      },
      {
        key: "student",
        header: text.colStudent,
        cell: (row) =>
          row.studentName || row.studentPublicId ? (
            <div>
              <div className="font-medium text-xs text-[var(--ink-primary)]">
                {row.studentName || text.studentFallback}
              </div>
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">{text.allSessionScope}</span>
          ),
      },
      {
        key: "severity",
        header: text.colSeverity,
        cell: (row) => {
          const { label, variant } = text.severityBadge(row.severity);
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        key: "status",
        header: text.colStatus,
        cell: (row) => {
          const { label, variant } = text.statusBadge(row.status);
          return <StatusBadge label={label} variant={variant} />;
        },
      },
      {
        key: "owner",
        header: text.colOwner,
        cell: (row) => (
          <div>
            <span className="text-xs font-medium text-[var(--ink-primary)]">
              {text.roleLabel(row.currentOwnerRole)}
            </span>
            {row.currentOwnerName && (
              <div className="text-[11px] text-[var(--ink-muted)]">{row.currentOwnerName}</div>
            )}
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: text.colUpdated,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{text.formatDateTime(row.updatedAt)}</span>
        ),
      },
    ],
    [text],
  );
};
