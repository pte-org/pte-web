"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { StudentAttemptHistoryRow, StudentAttemptStatus } from "@pte/api-client";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Badge,
  DataTable,
  Input,
  PaginationControls,
  Select,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import { useStudentAttempts } from "../api";
import type { StudentDetailText } from "../hooks/useStudentDetailText";
import { formatStudentDate, reportStateVariant } from "../utils";
import { StudentDetailStateMessage } from "./StudentDetailStateMessage";

interface StudentHistoryTabProps {
  studentPublicId: string;
  active: boolean;
  text: StudentDetailText;
}

export const StudentHistoryTab = ({
  studentPublicId,
  active,
  text,
}: StudentHistoryTabProps): ReactElement => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<StudentAttemptStatus | "ALL">("ALL");
  const query = { page, size, from: from || undefined, to: to || undefined, status };
  const history = useStudentAttempts(studentPublicId, query, active);

  const columns = useMemo<DataTableColumn<StudentAttemptHistoryRow>[]>(
    () => [
      {
        key: "session",
        header: text.history.session,
        cell: (row) => (
          <div>
            <p className="font-medium text-[var(--ink-primary)]">{row.sessionName}</p>
            {row.sessionCode && (
              <p className="mt-1 text-xs text-[var(--ink-muted)]">{row.sessionCode}</p>
            )}
          </div>
        ),
        sortable: false,
      },
      {
        key: "attempt",
        header: text.history.attempt,
        cell: (row) => `#${row.attemptNumber}`,
        sortable: false,
      },
      {
        key: "status",
        header: text.history.status,
        cell: (row) => (
          <StatusBadge
            label={text.history.attemptStatusLabel(row.status)}
            variant={
              row.status === "SUBMITTED"
                ? "success"
                : row.status === "IN_PROGRESS"
                  ? "warning"
                  : "neutral"
            }
          />
        ),
        sortable: false,
      },
      {
        key: "report",
        header: text.history.report,
        cell: (row) => (
          <div>
            <Badge variant={reportStateVariant(row.reportState)}>
              {text.history.reportStateLabel(row.reportState)}
            </Badge>
            {row.overallScore !== null && (
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                {text.history.overallScore(row.overallScore)}
              </p>
            )}
          </div>
        ),
        sortable: false,
      },
      {
        key: "createdAt",
        header: text.history.time,
        cell: (row) => formatStudentDate(row.createdAt, text.locale),
        sortable: false,
      },
    ],
    [text],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-[var(--surface-subtle)] p-3">
        <Input
          label={text.history.from}
          type="date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage(0);
          }}
        />
        <Input
          label={text.history.to}
          type="date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setPage(0);
          }}
        />
        <Select
          label={text.history.status}
          options={text.history.statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StudentAttemptStatus | "ALL");
            setPage(0);
          }}
        />
      </div>
      {history.error && (
        <StudentDetailStateMessage
          message={getUserFacingApiErrorMessage(history.error, text.genericError)}
        />
      )}
      <DataTable
        columns={columns}
        rows={history.data?.data ?? []}
        getRowKey={(row) => row.attemptPublicId}
        isLoading={history.isLoading || (history.isFetching && !history.data)}
        showSearch={false}
        clientSideFiltering={false}
        clientSideSorting={false}
        clientSidePagination={false}
        emptyTitle={text.history.emptyTitle}
        emptyDescription={text.history.emptyDescription}
        pagination={
          history.data ? (
            <PaginationControls
              meta={history.data.meta}
              onPageChange={setPage}
              disabled={history.isFetching}
              showPageSizeInput
              onPageSizeChange={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
            />
          ) : undefined
        }
      />
    </div>
  );
};
