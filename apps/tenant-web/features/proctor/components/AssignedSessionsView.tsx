"use client";

import { useCallback, useEffect, useMemo, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { AssignedProctorSessionResponse, ProctorScope } from "@pte/api-client";
import {
  ActionMenu,
  Button,
  DataTable,
  PageHeader,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import { useAssignedProctorSessions } from "../api";
import { useClientTimezone, useMidnightBoundaryRefresh } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import { PROCTOR_QUERY_KEYS } from "../queryKeys";

const VALID_SCOPES: ProctorScope[] = ["ALL", "ACCESSIBLE", "UPCOMING", "TODAY"];

function parseScope(value: string | null): ProctorScope {
  if (value && VALID_SCOPES.includes(value as ProctorScope)) {
    return value as ProctorScope;
  }
  return "ACCESSIBLE";
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

export function AssignedSessionsView(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const text = useProctorWorkspaceText();

  const { timezone, isResolved: isTimezoneResolved } = useClientTimezone();

  const scope = parseScope(searchParams.get("scope"));
  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const pageSize = 20;

  const updateUrl = useCallback(
    (newScope: ProctorScope, newPage = 0) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("scope", newScope);
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

  const listQuery = useAssignedProctorSessions({
    page,
    size: pageSize,
    scope,
    timezone,
  });

  const dayEnd = listQuery.data?.dayEnd;
  const handleMidnight = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: PROCTOR_QUERY_KEYS.all });
  }, [queryClient]);

  useMidnightBoundaryRefresh({
    dayEnd,
    timezone,
    onMidnight: handleMidnight,
  });

  const sessions = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalElements = meta?.totalElements ?? 0;
  const isOutOfRange = Boolean(meta && totalElements > 0 && page >= totalPages);

  useEffect(() => {
    if (isOutOfRange) {
      updateUrl(scope, Math.max(0, totalPages - 1));
    }
  }, [isOutOfRange, page, scope, totalPages, updateUrl]);

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

  const scopeTabs: Array<{ id: ProctorScope; label: string }> = useMemo(
    () => [
      { id: "ALL", label: text.filterAll },
      { id: "ACCESSIBLE", label: text.filterAccessible },
      { id: "UPCOMING", label: text.filterUpcoming },
      { id: "TODAY", label: text.filterToday },
    ],
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
      const canMonitor = row.canMonitor ?? row.status === "OPEN";

      const menuItems = [
        {
          label: canMonitor ? text.enterMonitoring : text.viewRoom,
          onClick: () => router.push(`/proctor/sessions/${sessionId}`),
        },
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
        <div className="flex items-center justify-end gap-2">
          {canMonitor ? (
            <Link href={`/proctor/sessions/${sessionId}`}>
              <Button variant="primary" size="sm">
                {text.enterMonitoring}
              </Button>
            </Link>
          ) : (
            <Link href={`/proctor/sessions/${sessionId}`}>
              <Button variant="secondary" size="sm">
                {text.viewRoom}
              </Button>
            </Link>
          )}
          <ActionMenu items={menuItems} label={text.tableColActions} />
        </div>
      );
    },
    [router, text],
  );

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <PageHeader
        title={text.pageTitle}
        subtitle={text.pageSubtitle}
        actions={
          <Link href="/proctor/sessions">
            <Button variant="secondary" size="sm">
              {text.overviewTitle}
            </Button>
          </Link>
        }
      />

      {/* Scope Filter Tabs Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mr-2">
          {text.filterScopeLabel}:
        </span>
        {scopeTabs.map((tab) => {
          const isActive = scope === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateUrl(tab.id, 0)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--border-subtle)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        rows={sessions}
        getRowKey={(row) => row.assignmentPublicId || row.examSessionPublicId || ""}
        isLoading={listQuery.isLoading || (scope === "TODAY" && !isTimezoneResolved)}
        emptyTitle={scope === "ALL" ? text.empty : text.emptyInScope}
        rowActions={renderRowActions}
        clientSideFiltering={false}
        clientSideSorting={false}
        clientSidePagination={false}
        showSearch={false}
        pagination={
          meta && meta.totalPages > 1 ? (
            <PaginationControls
              meta={meta}
              onPageChange={(nextPage) => updateUrl(scope, nextPage)}
              disabled={listQuery.isLoading}
            />
          ) : null
        }
      />
    </div>
  );
}
