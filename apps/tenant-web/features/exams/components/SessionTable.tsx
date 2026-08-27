"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Badge, DataTable, type DataTableColumn } from "@pte/ui";
import {
  EXAM_TABLE_HEADERS,
  EXAMS_TEXT,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_VARIANT,
} from "../constants";
import type { ExamSession } from "../types";

interface SessionTableProps {
  sessions: ExamSession[];
  isLoading?: boolean;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export const SessionTable = ({ sessions, isLoading }: SessionTableProps): ReactElement => {
  const columns: DataTableColumn<ExamSession>[] = [
    {
      key: "name",
      header: EXAM_TABLE_HEADERS.NAME,
      cell: (session) => (
        <Link href={`/host/exams/${session.id}`} className="font-medium text-blue-700 hover:underline">
          {session.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: EXAM_TABLE_HEADERS.STATUS,
      cell: (session) => (
        <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
          {SESSION_STATUS_LABELS[session.status]}
        </Badge>
      ),
    },
    {
      key: "opensAt",
      header: EXAM_TABLE_HEADERS.OPENS_AT,
      cell: (session) => formatDateTime(session.opensAt),
    },
    {
      key: "closesAt",
      header: EXAM_TABLE_HEADERS.CLOSES_AT,
      cell: (session) => formatDateTime(session.closesAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sessions}
      getRowKey={(session) => session.id}
      isLoading={isLoading}
      emptyTitle={EXAMS_TEXT.EMPTY_TITLE}
      emptyDescription={EXAMS_TEXT.EMPTY_TEXT}
    />
  );
};
