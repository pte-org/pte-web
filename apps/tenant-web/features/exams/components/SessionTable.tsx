"use client";

import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Badge,
  ConfirmDialog,
  DataTable,
  DateRangePicker,
  EyeIcon,
  PencilIcon,
  Select,
  TrashIcon,
  useLocale,
  useToast,
  XIcon,
  type DataTableColumn,
  type DateRangeValue,
  type DropdownItem,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useDeleteSession, useTransitionExamStatus } from "../api";
import {
  EXAM_TABLE_HEADERS,
  EXAM_ROW_ACTIONS_TEXT,
  EXAMS_TEXT,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TRANSITIONS,
  SESSION_STATUS_VARIANT,
} from "../constants";
import type { ExamSession } from "../types";

interface SessionTableProps {
  sessions: ExamSession[];
  isLoading?: boolean;
  toolbarActions?: ReactNode;
}

const EMPTY_DATE_RANGE: DateRangeValue = { from: "", to: "" };

function matchesSessionDateRange(session: ExamSession, range: DateRangeValue): boolean {
  if (!range.from && !range.to) return true;

  const sessionStart = Date.parse(session.opensAt);
  const sessionEnd = Date.parse(session.closesAt);
  if (!Number.isFinite(sessionStart) || !Number.isFinite(sessionEnd)) return false;

  const rangeStart = range.from ? Date.parse(`${range.from}T00:00:00`) : -Infinity;
  const rangeEnd = range.to ? Date.parse(`${range.to}T23:59:59.999`) : Infinity;
  return sessionEnd >= rangeStart && sessionStart <= rangeEnd;
}

function formatDateTime(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const SessionTable = ({
  sessions,
  isLoading,
  toolbarActions,
}: SessionTableProps): ReactElement => {
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const searchText = useTenantSearchText("sessions");
  const [dateRange, setDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [deleteTarget, setDeleteTarget] = useState<ExamSession | null>(null);
  const [statusEditingSessionId, setStatusEditingSessionId] = useState<string | null>(null);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<{
    session: ExamSession;
    nextStatus: ExamSession["status"];
  } | null>(null);
  const deleteSession = useDeleteSession();
  const statusUpdate = useTransitionExamStatus(statusUpdateTarget?.session.id ?? "");
  const dateRangeLabel = t("tenant.examList.dateRange", "Date range");
  const filteredSessions = useMemo(
    () => sessions.filter((session) => matchesSessionDateRange(session, dateRange)),
    [dateRange, sessions],
  );
  const statusLabel = (status: string): string =>
    t(
      `tenant.examStatus.${status.toLowerCase()}`,
      SESSION_STATUS_LABELS[status as keyof typeof SESSION_STATUS_LABELS] ?? status,
    );
  const actionText = {
    actions: t("tenant.examList.actions", EXAM_TABLE_HEADERS.ACTIONS),
    view: t("tenant.examList.view", EXAM_ROW_ACTIONS_TEXT.VIEW),
    updateStatus: t("tenant.examList.updateStatus", EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS),
    cancelUpdateStatus: t(
      "tenant.examList.cancelUpdateStatus",
      EXAM_ROW_ACTIONS_TEXT.CANCEL_UPDATE_STATUS,
    ),
    delete: t("tenant.examList.delete", EXAM_ROW_ACTIONS_TEXT.DELETE),
    deleteTitle: t("tenant.examList.deleteTitle", EXAM_ROW_ACTIONS_TEXT.DELETE_TITLE),
    deleteDescription: (name: string): string =>
      t("tenant.examList.deleteDescription", EXAM_ROW_ACTIONS_TEXT.DELETE_DESCRIPTION(name), {
        name,
      }),
    deleteConfirm: t("tenant.examList.deleteConfirm", EXAM_ROW_ACTIONS_TEXT.DELETE_CONFIRM),
    cancel: t("tenant.examList.cancel", EXAM_ROW_ACTIONS_TEXT.CANCEL),
    deleteSuccess: t("tenant.examList.deleteSuccess", EXAM_ROW_ACTIONS_TEXT.DELETE_SUCCESS),
    deleteFailed: t("tenant.examList.deleteFailed", EXAM_ROW_ACTIONS_TEXT.DELETE_FAILED),
    updateStatusTitle: (name: string): string =>
      t("tenant.examList.updateStatusTitle", EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS_TITLE(name), {
        name,
      }),
    updateStatusDescription: (name: string, current: string, next: string): string =>
      t(
        "tenant.examList.updateStatusDescription",
        EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS_DESCRIPTION(name, current, next),
        { name, current, next },
      ),
    updateStatusConfirm: t(
      "tenant.examList.updateStatusConfirm",
      EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS_CONFIRM,
    ),
    updateStatusSuccess: t(
      "tenant.examList.updateStatusSuccess",
      EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS_SUCCESS,
    ),
    updateStatusFailed: t(
      "tenant.examList.updateStatusFailed",
      EXAM_ROW_ACTIONS_TEXT.UPDATE_STATUS_FAILED,
    ),
  };
  const confirmDelete = (): void => {
    if (!deleteTarget) return;
    deleteSession.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast(actionText.deleteSuccess, { tone: "success" });
        setDeleteTarget(null);
      },
      onError: (error) => {
        showToast(errorMessage(error) ?? actionText.deleteFailed, { tone: "error" });
      },
    });
  };
  const confirmStatusUpdate = (): void => {
    if (!statusUpdateTarget) return;
    statusUpdate.mutate(statusUpdateTarget.nextStatus, {
      onSuccess: () => {
        showToast(actionText.updateStatusSuccess, { tone: "success" });
        setStatusUpdateTarget(null);
        setStatusEditingSessionId(null);
      },
      onError: (error) => {
        showToast(errorMessage(error) ?? actionText.updateStatusFailed, { tone: "error" });
      },
    });
  };
  const statusFilterOptions = [
    { value: "", label: t("tenant.examList.allStatuses", "All statuses") },
    ...Object.keys(SESSION_STATUS_LABELS).map((key) => ({
      value: key,
      label: statusLabel(key),
    })),
  ];
  const columns: DataTableColumn<ExamSession>[] = [
    {
      key: "name",
      header: t("tenant.examList.name", EXAM_TABLE_HEADERS.NAME),
      cell: (session) => <span className="font-medium text-gray-900">{session.name}</span>,
    },
    {
      key: "sessionCode",
      header: t("tenant.examList.code", EXAM_TABLE_HEADERS.CODE),
      className: "whitespace-nowrap",
      cell: (session) => (
        <code className="whitespace-nowrap text-xs text-gray-700">{session.sessionCode}</code>
      ),
    },
    {
      key: "status",
      header: t("tenant.examList.status", EXAM_TABLE_HEADERS.STATUS),
      filterOptions: statusFilterOptions,
      filterAccessor: (session) => session.status,
      cell: (session) => {
        const statusOptions = SESSION_STATUS_TRANSITIONS[session.status].map((status) => ({
          value: status,
          label: statusLabel(status),
          disabled: status === session.status,
        }));
        const hasStatusUpdates = statusOptions.some((option) => !option.disabled);
        const isStatusEditing = statusEditingSessionId === session.id;

        if (!hasStatusUpdates || !isStatusEditing) {
          return (
            <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
              {statusLabel(session.status)}
            </Badge>
          );
        }

        return (
          <Select
            aria-label={`${t("tenant.examList.status", EXAM_TABLE_HEADERS.STATUS)}: ${session.name}`}
            value={session.status}
            options={statusOptions}
            variant="table"
            size="sm"
            className="min-w-40"
            onChange={(event) => {
              const nextStatus = SESSION_STATUS_TRANSITIONS[session.status].find(
                (candidate) => candidate === event.target.value,
              );
              if (!nextStatus || nextStatus === session.status) return;
              setStatusUpdateTarget({ session, nextStatus });
            }}
          />
        );
      },
    },
    {
      key: "opensAt",
      header: t("tenant.examList.opens", EXAM_TABLE_HEADERS.OPENS_AT),
      cell: (session) => formatDateTime(session.opensAt, locale),
    },
    {
      key: "closesAt",
      header: t("tenant.examList.closes", EXAM_TABLE_HEADERS.CLOSES_AT),
      cell: (session) => formatDateTime(session.closesAt, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <DataTable
        columns={columns}
        rows={filteredSessions}
        getRowKey={(session) => session.id}
        isLoading={isLoading}
        emptyTitle={t("tenant.examList.emptyTitle", EXAMS_TEXT.EMPTY_TITLE)}
        emptyDescription={t("tenant.examList.emptyDescription", EXAMS_TEXT.EMPTY_TEXT)}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        filters={
          <DateRangePicker
            ariaLabel={dateRangeLabel}
            value={dateRange}
            onChange={setDateRange}
            placeholder={dateRangeLabel}
          />
        }
        rowActionsHeader={actionText.actions}
        rowActions={(session) => {
          const canUpdateStatus = SESSION_STATUS_TRANSITIONS[session.status].some(
            (nextStatus) => nextStatus !== session.status,
          );
          const isStatusEditing = statusEditingSessionId === session.id;
          const items: DropdownItem[] = [
            {
              label: actionText.view,
              icon: EyeIcon,
              onSelect: () => router.push(`/host/exams/${session.id}`),
            },
          ];
          if (canUpdateStatus) {
            items.push({
              label: isStatusEditing ? actionText.cancelUpdateStatus : actionText.updateStatus,
              icon: isStatusEditing ? XIcon : PencilIcon,
              onSelect: () => {
                statusUpdate.reset();
                setStatusEditingSessionId((current) =>
                  current === session.id ? null : session.id,
                );
              },
            });
          }
          if (session.status === "DRAFT") {
            items.push({ separator: true, key: "delete-divider" });
            items.push({
              label: actionText.delete,
              icon: TrashIcon,
              danger: true,
              onSelect: () => {
                deleteSession.reset();
                setStatusEditingSessionId(null);
                setDeleteTarget(session);
              },
            });
          }
          return <ActionMenu label={`${actionText.actions}: ${session.name}`} items={items} />;
        }}
        toolbarActions={toolbarActions}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title={actionText.deleteTitle}
        description={deleteTarget ? actionText.deleteDescription(deleteTarget.name) : ""}
        confirmLabel={actionText.deleteConfirm}
        cancelLabel={actionText.cancel}
        tone="danger"
        isConfirming={deleteSession.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleteSession.isPending) {
            deleteSession.reset();
            setDeleteTarget(null);
          }
        }}
      />
      <ConfirmDialog
        open={statusUpdateTarget !== null}
        title={
          statusUpdateTarget ? actionText.updateStatusTitle(statusUpdateTarget.session.name) : ""
        }
        description={
          statusUpdateTarget
            ? actionText.updateStatusDescription(
                statusUpdateTarget.session.name,
                statusLabel(statusUpdateTarget.session.status),
                statusLabel(statusUpdateTarget.nextStatus),
              )
            : ""
        }
        confirmLabel={actionText.updateStatusConfirm}
        cancelLabel={actionText.cancel}
        tone={
          statusUpdateTarget?.nextStatus === "CLOSED" ||
          statusUpdateTarget?.nextStatus === "CANCELLED"
            ? "danger"
            : "primary"
        }
        isConfirming={statusUpdate.isPending}
        onConfirm={confirmStatusUpdate}
        onClose={() => {
          if (!statusUpdate.isPending) {
            statusUpdate.reset();
            setStatusUpdateTarget(null);
            setStatusEditingSessionId(null);
          }
        }}
      />
    </div>
  );
};
