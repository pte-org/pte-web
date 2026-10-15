"use client";

import { useMemo, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  BackButton,
  Badge,
  Button,
  DataTable,
  ErrorState,
  PageHeader,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import type { IncidentResponse, IncidentStatus } from "@pte/api-client";
import { useIncidentsList } from "../api";
import { IncidentReportModal } from "./IncidentReportModal";
import {
  getIncidentSeverityBadge as getSeverityBadge,
  getIncidentStatusBadge as getStatusBadge,
  PROCTOR_INCIDENT_LIST_TEXT as T,
  PROCTOR_INCIDENT_STATUS_TABS,
} from "../constants";

interface IncidentListViewProps {
  sessionPublicId: string;
}

export function IncidentListView({ sessionPublicId }: IncidentListViewProps): ReactElement {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useIncidentsList(sessionPublicId, {
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    page,
    size: 20,
  });

  const incidents = data?.data ?? [];
  const meta = data?.meta;

  const columns: DataTableColumn<IncidentResponse>[] = useMemo(
    () => [
      {
        key: "title",
        header: T.COL_TITLE_CATEGORY,
        cell: (row) => (
          <div>
            <div className="font-medium text-[var(--ink-primary)]">{row.title}</div>
            <div className="text-xs text-[var(--ink-muted)]">
              #{row.incidentPublicId.slice(0, 8).toUpperCase()} • {row.category}
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
              {row.studentPublicId && (
                <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                  #{row.studentPublicId.slice(0, 8)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">{T.ALL_SESSION_SCOPE}</span>
          ),
      },
      {
        key: "severity",
        header: T.COL_SEVERITY,
        cell: (row) => {
          const { label, variant } = getSeverityBadge(row.severity);
          return <Badge variant={variant}>{label}</Badge>;
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
              {row.currentOwnerRole}
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

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${T.TITLE_PREFIX}${sessionPublicId.slice(0, 8).toUpperCase()}`}
        subtitle={T.SUBTITLE}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <BackButton href="/proctor/incidents" label={T.BACK_BTN} />
            <Button variant="primary" size="sm" onClick={() => setIsReportModalOpen(true)}>
              {T.REPORT_NEW_BTN}
            </Button>
          </div>
        }
      />

      {/* Status Filter Tabs Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mr-2">
          {T.FILTER_STATUS_LABEL}:
        </span>
        {PROCTOR_INCIDENT_STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.id);
                setPage(0);
              }}
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

      {isError ? (
        <ErrorState
          title={T.ERROR_TITLE}
          description={T.ERROR_DESC}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {T.RETRY_BTN}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={incidents}
          getRowKey={(row) => row.incidentPublicId}
          isLoading={isLoading}
          emptyTitle={T.EMPTY_TITLE}
          rowActions={(row) => (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(`/proctor/incidents/${sessionPublicId}/${row.incidentPublicId}`)
                }
              >
                {T.ACTION_DETAIL}
              </Button>
            </div>
          )}
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          showSearch={false}
          pagination={
            meta && meta.totalPages > 1 ? (
              <PaginationControls meta={meta} onPageChange={setPage} disabled={isLoading} />
            ) : null
          }
        />
      )}

      <IncidentReportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sessionPublicId={sessionPublicId}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
