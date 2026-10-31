"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage, type ChatStudentUsageResponse } from "@pte/api-client";
import { Alert, DashboardCard, DataTable, type DataTableColumn } from "@pte/ui";
import { useChatTopStudents } from "../api";
import { CHAT_USAGE_COPY } from "../constants";

interface ChatTopStudentsProps {
  from: string;
  to: string;
  locale: "en" | "vi";
}

/** The students who sent the most messages in the range. Only ids and counts exist, so only those are shown. */
export const ChatTopStudents = ({ from, to, locale }: ChatTopStudentsProps): ReactElement => {
  const T = CHAT_USAGE_COPY[locale];
  const students = useChatTopStudents(from, to);
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");

  const columns: DataTableColumn<ChatStudentUsageResponse>[] = [
    {
      key: "studentId",
      header: T.STUDENT_ID,
      cell: (student) => <span className="font-mono text-xs">{student.studentId}</span>,
    },
    { key: "messages", header: T.STUDENT_MESSAGES, cell: (student) => number.format(student.messages) },
  ];

  return (
    <DashboardCard>
      <h2 className="text-base font-semibold">{T.STUDENTS_TITLE}</h2>
      <p className="mb-3 mt-1 text-sm text-[var(--table-muted-text)]">{T.STUDENTS_NOTE}</p>
      {students.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(students.error, T.STUDENTS_LOAD_FAILED)}</Alert>
      )}
      <DataTable
        columns={columns}
        rows={students.data ?? []}
        getRowKey={(student) => student.studentId}
        isLoading={students.isLoading}
        emptyTitle={T.STUDENTS_EMPTY}
        clientSideFiltering={false}
        clientSidePagination={false}
      />
    </DashboardCard>
  );
};
