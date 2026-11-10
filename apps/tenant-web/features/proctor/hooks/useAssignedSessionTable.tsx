"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AssignedProctorSessionResponse } from "@pte/api-client";
import { ActionMenu, Button, StatusBadge, type DataTableColumn } from "@pte/ui";
import { useProctorWorkspaceText } from "./useProctorWorkspaceText";

function getStatusBadgeVariant(status: string): "success" | "info" | "neutral" | "danger" {
  switch (status) {
    case "OPEN":
      return "success";
    case "SCHEDULED":
      return "info";
    case "CANCELLED":
      return "danger";
    case "CLOSED":
    default:
      return "neutral";
  }
}

interface AssignedSessionTable {
  columns: DataTableColumn<AssignedProctorSessionResponse>[];
  renderRowActions: (row: AssignedProctorSessionResponse) => ReactNode;
}

export const useAssignedSessionTable = (): AssignedSessionTable => {
  const router = useRouter();
  const text = useProctorWorkspaceText();
  const formatDateTime = useCallback(
    (iso: string): string => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    },
    [text.locale],
  );

  const getStatusLabel = useCallback(
    (status: string): string => {
      switch (status) {
        case "OPEN":
          return text.statusOpen;
        case "SCHEDULED":
          return text.statusScheduled;
        case "CLOSED":
          return text.statusClosed;
        case "CANCELLED":
          return text.statusCancelled;
        default:
          return status;
      }
    },
    [text],
  );

  const columns: DataTableColumn<AssignedProctorSessionResponse>[] = useMemo(
    () => [
      {
        key: "name",
        header: text.tableColName,
        cell: (row) => {
          const sessionId = row.examSessionPublicId || row.sessionPublicId || "";
          return (
            <div>
              <div className="font-medium text-[var(--ink-primary)]">{row.name}</div>
              <div className="font-mono text-xs text-[var(--ink-muted)]">
                #{sessionId ? sessionId.slice(0, 8).toUpperCase() : "â€”"}
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: text.tableColStatus,
        cell: (row) => (
          <StatusBadge
            label={getStatusLabel(row.status)}
            variant={getStatusBadgeVariant(row.status)}
          />
        ),
      },
      {
        key: "opensAt",
        header: text.tableColOpensAt,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{formatDateTime(row.opensAt)}</span>
        ),
      },
      {
        key: "closesAt",
        header: text.tableColClosesAt,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {formatDateTime(row.closesAt)}
          </span>
        ),
      },
      {
        key: "role",
        header: text.tableColRole,
        cell: (row) => {
          const isLead = (row.assignmentRole || row.role) === "LEAD_PROCTOR";
          return (
            <span className="text-xs font-medium text-[var(--ink-primary)]">
              {isLead ? text.roleLead : text.roleProctor}
            </span>
          );
        },
      },
    ],
    [formatDateTime, getStatusLabel, text],
  );
  const renderRowActions = useCallback(
    (row: AssignedProctorSessionResponse) => {
      const sessionId = row.examSessionPublicId || row.sessionPublicId || "";

      const menuItems = [
        {
          label: text.actionRecordAttendance,
          onClick: () => router.push(`/proctor/attendance/${sessionId}`),
        },
        {
          label: text.actionViewIncidents,
          onClick: () => router.push(`/proctor/incidents/${sessionId}`),
        },
        {
          label: text.actionViewAudit,
          onClick: () => router.push(`/proctor/audit-log/${sessionId}`),
        },
      ];

      return (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Link href={`/proctor/attendance/${sessionId}`} className="shrink-0">
            <Button variant="primary" size="sm">
              {text.openSession}
            </Button>
          </Link>
          <ActionMenu items={menuItems} label={text.tableColActions} />
        </div>
      );
    },
    [router, text],
  );
  return { columns, renderRowActions };
};
