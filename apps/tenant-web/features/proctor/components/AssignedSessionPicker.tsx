"use client";

import { useCallback, useMemo, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AssignedProctorSessionResponse } from "@pte/api-client";
import {
  Button,
  DataTable,
  ErrorState,
  PageHeader,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import { useAssignedProctorSessions } from "../api";
import { useClientTimezone } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

interface AssignedSessionPickerProps {
  mode: "attendance" | "audit-log" | "incidents";
  title: string;
  subtitle: string;
}

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

export function AssignedSessionPicker({
  mode,
  title,
  subtitle,
}: AssignedSessionPickerProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const text = useProctorWorkspaceText();
  const { timezone, isResolved } = useClientTimezone();

  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const pageSize = 20;

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 0) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const { data, isLoading, isError, refetch } = useAssignedProctorSessions({
    scope: "ALL",
    timezone: isResolved ? timezone : undefined,
    page,
    size: pageSize,
  });

  const sessions = data?.data ?? [];
  const meta = data?.meta;

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

  const getTargetUrl = useCallback(
    (sessionPublicId: string): string => {
      if (mode === "attendance") {
        return `/proctor/attendance/${sessionPublicId}`;
      }
      if (mode === "incidents") {
        return `/proctor/incidents/${sessionPublicId}`;
      }
      return `/proctor/audit-log/${sessionPublicId}`;
    },
    [mode],
  );

  const getActionLabel = useCallback((): string => {
    if (mode === "attendance") {
      return text.actionRecordAttendance;
    }
    if (mode === "incidents") {
      return text.actionViewIncidents;
    }
    return text.actionViewAudit;
  }, [mode, text]);

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

  const columns: DataTableColumn<AssignedProctorSessionResponse>[] = useMemo(
    () => [
      {
        key: "name",
        header: text.tableColName,
        cell: (row) => {
          const sessionId = row.sessionPublicId ?? row.examSessionPublicId ?? "";
          return (
            <div>
              <div className="font-medium text-[var(--ink-primary)]">{row.name}</div>
              <div className="font-mono text-xs text-[var(--ink-muted)]">
                #{sessionId ? sessionId.slice(0, 8).toUpperCase() : "—"}
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
          <span className="text-xs text-[var(--ink-secondary)]">{formatDateTime(row.closesAt)}</span>
        ),
      },
    ],
    [formatDateTime, getStatusLabel, text],
  );

  const renderRowActions = useCallback(
    (row: AssignedProctorSessionResponse) => {
      const sessionId = row.sessionPublicId ?? row.examSessionPublicId ?? "";
      return (
        <div className="flex justify-end">
          <Link href={getTargetUrl(sessionId)}>
            <Button variant="primary" size="sm">
              {getActionLabel()}
            </Button>
          </Link>
        </div>
      );
    },
    [getActionLabel, getTargetUrl],
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Link href="/proctor/sessions">
            <Button variant="secondary" size="sm">
              {text.overviewTitle}
            </Button>
          </Link>
        }
      />

      {isError ? (
        <ErrorState
          title={text.error}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {text.retry}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={sessions}
          getRowKey={(row) => row.assignmentPublicId || row.sessionPublicId || row.examSessionPublicId || ""}
          isLoading={isLoading}
          emptyTitle={text.empty}
          rowActions={renderRowActions}
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          showSearch={false}
          pagination={
            meta && meta.totalPages > 1 ? (
              <PaginationControls
                meta={meta}
                onPageChange={setPage}
                disabled={isLoading}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}
