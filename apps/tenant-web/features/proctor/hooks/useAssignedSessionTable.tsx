"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import type { AssignedProctorSessionResponse } from "@pte/api-client";
import { Button, StatusBadge, type DataTableColumn } from "@pte/ui";
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
        cell: (row) => <div className="font-medium text-[var(--ink-primary)]">{row.name}</div>,
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
    ],
    [formatDateTime, getStatusLabel, text],
  );
  const renderRowActions = useCallback(
    (row: AssignedProctorSessionResponse) => {
      const sessionId = row.examSessionPublicId || row.sessionPublicId || "";

      return (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Link href={`/proctor/attendance/${sessionId}`} className="shrink-0">
            <Button variant="primary" size="sm">
              {text.openSession}
            </Button>
          </Link>
        </div>
      );
    },
    [text],
  );
  return { columns, renderRowActions };
};
