"use client";

import { useState, type ReactElement } from "react";
import type { StudentRosterRow } from "@pte/api-client";
import {
  Alert,
  DataTable,
  ActionMenu,
  LockIcon,
  PaginationControls,
  type DataTableColumn,
} from "@pte/ui";
import {
  LEARNERS_OVERVIEW_TEXT,
  STUDENT_ROW_ACTIONS_TEXT,
  STUDENT_TABLE_HEADERS,
} from "./constants";
import { useResetStudentPassword } from "../api";
import { errorMessage } from "../errorMessage";
import { ResetStudentPasswordModal } from "./ResetStudentPasswordModal";
import { useStudentRoster } from "@/features/studentSearch/api";

const T = LEARNERS_OVERVIEW_TEXT;

export const LearnersOverview = (): ReactElement => {
  const [page, setPage] = useState(0);
  const studentsQuery = useStudentRoster({
    page,
    size: 20,
    search: "",
    assignmentStatus: "ALL",
    sort: "CREATED_AT",
    direction: "DESC",
  });
  const [resetTarget, setResetTarget] = useState<StudentRosterRow | null>(null);
  const resetPassword = useResetStudentPassword(resetTarget?.studentPublicId ?? "");

  const columns: DataTableColumn<StudentRosterRow>[] = [
    {
      key: "fullName",
      header: STUDENT_TABLE_HEADERS.FULL_NAME,
      cell: (student) => (
        <span className="font-medium text-gray-900">{student.fullName ?? T.EMPTY_VALUE}</span>
      ),
    },
    {
      key: "email",
      header: STUDENT_TABLE_HEADERS.EMAIL,
      cell: (student) => student.email ?? T.EMPTY_VALUE,
    },
    {
      key: "studentCode",
      header: STUDENT_TABLE_HEADERS.STUDENT_CODE,
      cell: (student) => student.studentCode ?? T.EMPTY_VALUE,
    },
    {
      key: "className",
      header: STUDENT_TABLE_HEADERS.CLASS_NAME,
      cell: (student) => student.className ?? T.EMPTY_VALUE,
    },
    {
      key: "phone",
      header: STUDENT_TABLE_HEADERS.PHONE,
      cell: (student) => student.phone ?? T.EMPTY_VALUE,
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900">{T.TITLE}</h2>
        <p className="text-sm text-gray-600">{T.SUBTITLE}</p>
      </div>

      {studentsQuery.error && (
        <Alert tone="error" title={T.UNABLE_TO_LOAD}>
          {errorMessage(studentsQuery.error) ?? T.UNABLE_TO_LOAD_FALLBACK}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={studentsQuery.data?.data ?? []}
        getRowKey={(student) => student.studentPublicId}
        isLoading={studentsQuery.isLoading}
        emptyTitle={T.EMPTY_TITLE}
        emptyDescription={T.EMPTY_TEXT}
        rowActions={(student) => (
          <ActionMenu
            items={[
              {
                label: STUDENT_ROW_ACTIONS_TEXT.RESET_PASSWORD,
                icon: LockIcon,
                onSelect: () => setResetTarget(student),
              },
            ]}
          />
        )}
      />

      {studentsQuery.data && (
        <PaginationControls
          meta={studentsQuery.data.meta}
          onPageChange={setPage}
          disabled={studentsQuery.isFetching}
          totalItemsLabel={T.TOTAL_ITEMS(studentsQuery.data.meta.totalElements)}
        />
      )}

      <ResetStudentPasswordModal
        key={resetTarget ? `reset-${resetTarget.studentPublicId}` : "reset-closed"}
        open={resetTarget !== null}
        onClose={() => {
          resetPassword.reset();
          setResetTarget(null);
        }}
        onSubmit={(newPassword) =>
          resetPassword.mutate(newPassword, { onSuccess: () => setResetTarget(null) })
        }
        error={errorMessage(resetPassword.error)}
        isSubmitting={resetPassword.isPending}
      />
    </section>
  );
};
