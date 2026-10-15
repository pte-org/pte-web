"use client";

import { useMemo, useState, type ReactElement } from "react";
import {
  Alert,
  BackButton,
  Badge,
  Button,
  DataTable,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
  Textarea,
  type DataTableColumn,
} from "@pte/ui";
import type { IncidentHistoryItemResponse, IncidentSeverity, IncidentStatus } from "@pte/api-client";
import {
  useIncidentDetail,
  useIncidentHistory,
  useUpdateIncidentStatusMutation,
} from "../api";

interface IncidentDetailViewProps {
  sessionPublicId: string;
  incidentPublicId: string;
}

function getSeverityBadge(severity: IncidentSeverity = "MEDIUM"): { label: string; variant: "danger" | "warning" | "neutral" } {
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

function getStatusBadge(status: IncidentStatus = "NEW"): { label: string; variant: "danger" | "info" | "success" | "warning" | "neutral" } {
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

export function IncidentDetailView({
  sessionPublicId,
  incidentPublicId,
}: IncidentDetailViewProps): ReactElement {
  const [modalAction, setModalAction] = useState<"ESCALATE" | "RESOLVE" | "NOTE" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detailQuery = useIncidentDetail(sessionPublicId, incidentPublicId);
  const historyQuery = useIncidentHistory(sessionPublicId, incidentPublicId);
  const updateMutation = useUpdateIncidentStatusMutation(sessionPublicId, incidentPublicId);

  const incident = detailQuery.data;
  const history = historyQuery.data ?? [];

  const handleStatusChange = async (targetStatus: IncidentStatus, notes?: string, resolution?: string) => {
    try {
      setErrorMessage(null);
      await updateMutation.mutateAsync({
        status: targetStatus,
        notes: notes?.trim() || undefined,
        resolutionSummary: resolution?.trim() || undefined,
      });
      setModalAction(null);
      setActionNote("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Thao tác không thành công.");
    }
  };

  const historyColumns: DataTableColumn<IncidentHistoryItemResponse>[] = useMemo(
    () => [
      {
        key: "time",
        header: "Thời gian",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {new Date(row.createdAt).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "actor",
        header: "Người thực hiện",
        cell: (row) => (
          <div>
            <div className="font-medium text-xs text-[var(--ink-primary)]">{row.actorName}</div>
            <Badge variant="neutral" className="mt-0.5 text-[10px]">
              {row.actorRole}
            </Badge>
          </div>
        ),
      },
      {
        key: "action",
        header: "Thao tác & Trạng thái",
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            {row.fromStatus && (
              <>
                <StatusBadge
                  label={getStatusBadge(row.fromStatus).label}
                  variant={getStatusBadge(row.fromStatus).variant}
                />
                <span className="text-[var(--ink-muted)]">→</span>
              </>
            )}
            <StatusBadge
              label={getStatusBadge(row.toStatus).label}
              variant={getStatusBadge(row.toStatus).variant}
            />
          </div>
        ),
      },
      {
        key: "notes",
        header: "Ghi chú / Biên bản",
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{row.notes || "—"}</span>
        ),
      },
    ],
    [],
  );

  if (detailQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <BackButton
          href={`/proctor/incidents/${sessionPublicId}`}
          label="Danh sách sự cố ca thi"
        />
        <LoadingState variant="rows" label="Đang tải chi tiết sự cố..." />
      </div>
    );
  }

  if (detailQuery.isError || !incident) {
    return (
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <BackButton
          href={`/proctor/incidents/${sessionPublicId}`}
          label="Danh sách sự cố ca thi"
        />
        <ErrorState
          title="Không thể tải chi tiết sự cố"
          description="Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ. Vui lòng thử lại."
          action={
            <Button variant="secondary" size="sm" onClick={() => void detailQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <BackButton
          href={`/proctor/incidents/${sessionPublicId}`}
          label="Danh sách sự cố ca thi"
        />
        <div className="flex flex-wrap items-center gap-2">
          {incident?.status === "NEW" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() => void handleStatusChange("IN_PROGRESS", "Tiếp nhận xử lý sự cố")}
            >
              Tiếp nhận xử lý
            </Button>
          )}

          {incident?.status === "IN_PROGRESS" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => setModalAction("ESCALATE")}
              >
                Chuyển cấp Admin
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => setModalAction("RESOLVE")}
              >
                Giải quyết sự cố
              </Button>
            </>
          )}

          {incident?.status === "RESOLVED" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() => void handleStatusChange("CLOSED", "Đóng sự cố")}
            >
              Đóng hồ sơ sự cố
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalAction("NOTE")}
            disabled={updateMutation.isPending}
          >
            Bổ sung ghi chú
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert tone="error" title="Thao tác thất bại">
          {errorMessage}
        </Alert>
      )}

      {/* Incident Header & Cards */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
                #{incidentPublicId.slice(0, 8).toUpperCase()}
              </span>
              <Badge variant={getSeverityBadge(incident?.severity).variant}>
                {getSeverityBadge(incident?.severity).label}
              </Badge>
              <StatusBadge
                label={getStatusBadge(incident?.status).label}
                variant={getStatusBadge(incident?.status).variant}
              />
            </div>
            <h1 className="mt-2 text-xl font-bold text-[var(--ink-primary)]">
              {incident?.title ?? "Đang tải sự cố..."}
            </h1>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Phân loại: <strong className="text-[var(--ink-secondary)]">{incident?.category}</strong> • Người báo cáo:{" "}
              <strong className="text-[var(--ink-secondary)]">{incident?.reporterName} ({incident?.reporterRole})</strong> • Lúc{" "}
              {incident?.createdAt ? new Date(incident.createdAt).toLocaleString("vi-VN") : "—"}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Nội dung mô tả sự cố
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink-primary)]">
              {incident?.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Kết luận / Phương án giải quyết
            </h4>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              {incident?.resolutionSummary || "Chưa có kết luận giải quyết."}
            </p>
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">
          Lịch sử xử lý & Bàn giao sự cố
        </h3>
        <DataTable
          columns={historyColumns}
          rows={history}
          getRowKey={(row) => row.id}
          isLoading={historyQuery.isLoading}
          emptyTitle="Chưa có bản ghi lịch sử xử lý nào."
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          showSearch={false}
        />
      </div>

      {/* Action Dialog */}
      <Modal
        open={Boolean(modalAction)}
        onClose={() => setModalAction(null)}
        title={
          modalAction === "ESCALATE"
            ? "Chuyển cấp sự cố lên Admin"
            : modalAction === "RESOLVE"
              ? "Xác nhận giải quyết sự cố"
              : "Bổ sung ghi chú vào hồ sơ sự cố"
        }
        size="md"
        isDismissDisabled={updateMutation.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalAction(null)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant={modalAction === "ESCALATE" ? "danger" : "primary"}
              disabled={updateMutation.isPending || !actionNote.trim()}
              onClick={() => {
                if (modalAction === "ESCALATE") {
                  void handleStatusChange("ESCALATED", actionNote);
                } else if (modalAction === "RESOLVE") {
                  void handleStatusChange("RESOLVED", actionNote, actionNote);
                } else {
                  void handleStatusChange(incident?.status ?? "IN_PROGRESS", actionNote);
                }
              }}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[var(--ink-secondary)]">
            {modalAction === "ESCALATE"
              ? "Lý do và nội dung chuyển cấp Admin *"
              : modalAction === "RESOLVE"
                ? "Tóm tắt kết quả và phương án giải quyết *"
                : "Nội dung ghi chú *"}:
          </label>
          <Textarea
            rows={4}
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder="Nhập nội dung chi tiết..."
          />
        </div>
      </Modal>
    </div>
  );
}
