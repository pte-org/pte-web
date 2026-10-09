"use client";

import { useState, type ReactElement } from "react";
import { Button, DataTable, PageHeader, type DataTableColumn } from "@pte/ui";
import { useProctorLiveAttempts } from "../api";
import {
  ATTEMPT_STATUS_FILTER_OPTIONS,
  ATTEMPT_STATUS_LABELS,
  PROCTOR_LIVE_TEXT as T,
} from "../constants";
import type { ProctorLiveAttempt } from "../types";

interface LiveMonitoringViewProps {
  sessionPublicId: string;
}

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

function formatTimestamp(value: string | null): string {
  if (value === null) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium" }).format(date);
}

export const LiveMonitoringView = ({ sessionPublicId }: LiveMonitoringViewProps): ReactElement => {
  const attempts = useProctorLiveAttempts(sessionPublicId);
  const [selectedAttemptPublicId, setSelectedAttemptPublicId] = useState<string | null>(null);

  const columns: DataTableColumn<ProctorLiveAttempt>[] = [
    {
      key: "attemptPublicId",
      header: T.COL_ATTEMPT,
      cell: (row) => `#${shortId(row.attemptPublicId)}`,
    },
    {
      key: "studentName",
      header: T.COL_STUDENT,
      cell: (row) => row.studentName,
    },
    {
      key: "status",
      header: T.COL_STATUS,
      filterOptions: ATTEMPT_STATUS_FILTER_OPTIONS,
      filterAccessor: (row) => row.status,
      cell: (row) => ATTEMPT_STATUS_LABELS[row.status],
    },
    {
      key: "lastHeartbeatAt",
      header: T.COL_LAST_HEARTBEAT,
      filterType: "date-range",
      filterAccessor: (row) => row.lastHeartbeatAt,
      filterPlaceholder: "Date range",
      cell: (row) => formatTimestamp(row.lastHeartbeatAt),
    },
    {
      key: "flagged",
      header: T.COL_FLAGS,
      cell: (row) => (row.flagged ? "⚑" : "—"),
    },
    {
      key: "notesCount",
      header: T.COL_NOTES,
      cell: (row) => row.notesCount,
    },
  ];

  const list = attempts.data ?? [];
  const selectedExists =
    selectedAttemptPublicId !== null &&
    list.some((row) => row.attemptPublicId === selectedAttemptPublicId);
  const isActionDisabled = !selectedExists;

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span>
          {T.SESSION_ID_LABEL}:{" "}
          <code className="font-mono text-xs">#{shortId(sessionPublicId)}</code>
        </span>
      </section>

      <DataTable<ProctorLiveAttempt>
        columns={columns}
        rows={list}
        getRowKey={(row) => row.attemptPublicId}
        isLoading={attempts.isFetching}
        emptyTitle={T.EMPTY_ATTEMPTS_TITLE}
        emptyDescription={T.EMPTY_ATTEMPTS_DESCRIPTION}
        selectable
        selectedKeys={selectedAttemptPublicId ? new Set([selectedAttemptPublicId]) : new Set()}
        onSelectionChange={(keys) => {
          const first = keys.values().next().value;
          setSelectedAttemptPublicId(typeof first === "string" ? first : null);
        }}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{T.FORCE_SUBMIT}</h2>
        <p className="text-sm text-slate-600">{T.ACTIONS_DISABLED_HINT}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={isActionDisabled}>
            {T.FORCE_SUBMIT}
          </Button>
          <Button variant="secondary" disabled={isActionDisabled}>
            {T.FLAG_VIOLATION}
          </Button>
          <Button variant="ghost" disabled>
            {T.CLOSE_SESSION}
          </Button>
        </div>
      </section>
    </div>
  );
};
