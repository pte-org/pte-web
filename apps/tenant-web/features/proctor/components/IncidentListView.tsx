"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BackButton,
  Badge,
  Button,
  DataTable,
  PageHeader,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import type { IncidentResponse, IncidentSeverity, IncidentStatus } from "@pte/api-client";
import { useIncidentsList } from "../api";
import { IncidentReportModal } from "./IncidentReportModal";

interface IncidentListViewProps {
  sessionPublicId: string;
}

function getSeverityBadge(severity: IncidentSeverity): { label: string; variant: "danger" | "warning" | "neutral" } {
  switch (severity) {
    case "HIGH":
      return { label: "Nghiêm trọng (HIGH)", variant: "danger" };
    case "MEDIUM":
      return { label: "Trung bình (MEDIUM)", variant: "warning" };
    case "LOW":
    default:
      return { label: "Thấp (LOW)", variant: "neutral" };
  }
}

function getStatusBadge(status: IncidentStatus): { label: string; variant: "danger" | "info" | "success" | "warning" | "neutral" } {
  switch (status) {
    case "NEW":
      return { label: "Mới tiếp nhận", variant: "warning" };
    case "IN_PROGRESS":
      return { label: "Đang xử lý", variant: "info" };
    case "ESCALATED":
      return { label: "Đã chuyển cấp Admin", variant: "danger" };
    case "RESOLVED":
      return { label: "Đã giải quyết", variant: "success" };
    case "CLOSED":
    default:
      return { label: "Đã đóng", variant: "neutral" };
  }
}

const STATUS_TABS: Array<{ id: IncidentStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "Tất cả" },
  { id: "NEW", label: "Mới báo cáo" },
  { id: "IN_PROGRESS", label: "Đang xử lý" },
  { id: "ESCALATED", label: "Chuyển cấp Admin" },
  { id: "RESOLVED", label: "Đã giải quyết" },
  { id: "CLOSED", label: "Đã đóng" },
];

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
        header: "Tiêu đề & Phân loại",
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
        header: "Thí sinh liên quan",
        cell: (row) =>
          row.studentName || row.studentPublicId ? (
            <div>
              <div className="font-medium text-xs text-[var(--ink-primary)]">
                {row.studentName || "Thí sinh"}
              </div>
              {row.studentPublicId && (
                <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                  #{row.studentPublicId.slice(0, 8)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-muted)]">Toàn ca thi</span>
          ),
      },
      {
        key: "severity",
        header: "Mức độ",
        cell: (row) => {
          const { label, variant } = getSeverityBadge(row.severity);
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (row) => {
          const { label, variant } = getStatusBadge(row.status);
          return <StatusBadge label={label} variant={variant} />;
        },
      },
      {
        key: "owner",
        header: "Phụ trách hiện tại",
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
        header: "Cập nhật",
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
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/proctor/incidents" label="Danh sách ca thi" />
        <Button variant="primary" size="sm" onClick={() => setIsReportModalOpen(true)}>
          + Báo cáo sự cố mới
        </Button>
      </div>

      <PageHeader
        title={`Sự cố phòng thi: #${sessionPublicId.slice(0, 8).toUpperCase()}`}
        subtitle="Theo dõi, điều phối và chuyển cấp các sự cố xảy ra trong ca thi."
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border-subtle)] pb-3">
        {STATUS_TABS.map((tab) => {
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách sự cố.</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={incidents}
          getRowKey={(row) => row.incidentPublicId}
          isLoading={isLoading}
          emptyTitle="Chưa có sự cố nào được ghi nhận cho ca thi này."
          rowActions={(row) => (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(`/proctor/incidents/${sessionPublicId}/${row.incidentPublicId}`)
                }
              >
                Chi tiết
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
