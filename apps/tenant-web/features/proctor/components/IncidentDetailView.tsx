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
import type { IncidentHistoryItemResponse, IncidentStatus } from "@pte/api-client";
import {
  useIncidentDetail,
  useIncidentHistory,
  useUpdateIncidentStatusMutation,
} from "../api";

interface IncidentDetailViewProps {
  sessionPublicId: string;
  incidentPublicId: string;
}

import {
  getIncidentSeverityBadge as getSeverityBadge,
  getIncidentStatusBadge as getStatusBadge,
  PROCTOR_INCIDENT_DETAIL_TEXT as T,
} from "../constants";

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
      setErrorMessage(err instanceof Error ? err.message : T.ACTION_FAILED_DEFAULT);
    }
  };

  const historyColumns: DataTableColumn<IncidentHistoryItemResponse>[] = useMemo(
    () => [
      {
        key: "time",
        header: T.COL_TIME,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">
            {new Date(row.createdAt).toLocaleString("vi-VN")}
          </span>
        ),
      },
      {
        key: "actor",
        header: T.COL_ACTOR,
        cell: (row) => (
          <div>
            <div className="font-medium text-xs text-[var(--ink-primary)]">{row.actorName}</div>
            <Badge variant="neutral" className="mt-0.5 text-[10px]">
              {row.actorRole ?? T.DEFAULT_ACTOR_ROLE}
            </Badge>
          </div>
        ),
      },
      {
        key: "action",
        header: T.COL_ACTION_STATUS,
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
        header: T.COL_NOTES,
        cell: (row) => (
          <span className="text-xs text-[var(--ink-secondary)]">{row.notes || "—"}</span>
        ),
      },
    ],
    [],
  );

  if (detailQuery.isLoading) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={T.LOADING}
          actions={
            <BackButton
              href={`/proctor/incidents/${sessionPublicId}`}
              label={T.BACK_BTN}
            />
          }
        />
        <LoadingState variant="rows" label={T.LOADING} />
      </div>
    );
  }

  if (detailQuery.isError || !incident) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={T.ERROR_TITLE}
          actions={
            <BackButton
              href={`/proctor/incidents/${sessionPublicId}`}
              label={T.BACK_BTN}
            />
          }
        />
        <ErrorState
          title={T.ERROR_TITLE}
          description={T.ERROR_DESC}
          action={
            <Button variant="secondary" size="sm" onClick={() => void detailQuery.refetch()}>
              {T.RETRY_BTN}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={incident?.title ?? T.LOADING}
        subtitle={`${T.CATEGORY_LABEL}${incident?.category ?? "—"} • ${T.REPORTER_LABEL}${incident?.reporterName ?? "—"} (${incident?.reporterRole ?? "—"}) • ${T.TIME_LABEL}${incident?.createdAt ? new Date(incident.createdAt).toLocaleString("vi-VN") : "—"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <BackButton
              href={`/proctor/incidents/${sessionPublicId}`}
              label={T.BACK_BTN}
            />
            {incident?.status === "NEW" && (
              <Button
                variant="secondary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => void handleStatusChange("IN_PROGRESS", T.ACTION_TAKE_OWNERSHIP_NOTE)}
              >
                {T.BTN_TAKE_OWNERSHIP}
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
                  {T.BTN_ESCALATE}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() => setModalAction("RESOLVE")}
                >
                  {T.BTN_RESOLVE}
                </Button>
              </>
            )}

            {incident?.status === "RESOLVED" && (
              <Button
                variant="secondary"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => void handleStatusChange("CLOSED", T.ACTION_CLOSE_NOTE)}
              >
                {T.BTN_CLOSE}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalAction("NOTE")}
              disabled={updateMutation.isPending}
            >
              {T.BTN_ADD_NOTE}
            </Button>
          </div>
        }
      />

      {errorMessage && (
        <Alert tone="error" title={T.ACTION_FAILED_TITLE}>
          {errorMessage}
        </Alert>
      )}

      {/* Incident Details Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 shadow-sm">
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

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              {T.SECTION_DESCRIPTION}
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink-primary)]">
              {incident?.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              {T.SECTION_RESOLUTION}
            </h4>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              {incident?.resolutionSummary || T.EMPTY_RESOLUTION}
            </p>
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">
          {T.TIMELINE_TITLE}
        </h3>
        <DataTable
          columns={historyColumns}
          rows={history}
          getRowKey={(row) => row.id}
          isLoading={historyQuery.isLoading}
          emptyTitle={T.TIMELINE_EMPTY}
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
            ? T.MODAL_TITLE_ESCALATE
            : modalAction === "RESOLVE"
              ? T.MODAL_TITLE_RESOLVE
              : T.MODAL_TITLE_NOTE
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
              {T.MODAL_CANCEL_BTN}
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
              {updateMutation.isPending ? T.MODAL_SAVING_BTN : T.MODAL_CONFIRM_BTN}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[var(--ink-secondary)]">
            {modalAction === "ESCALATE"
              ? T.LABEL_ESCALATE
              : modalAction === "RESOLVE"
                ? T.LABEL_RESOLVE
                : T.LABEL_NOTE}:
          </label>
          <Textarea
            rows={4}
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder={T.PLACEHOLDER_ACTION_NOTE}
          />
        </div>
      </Modal>
    </div>
  );
}
