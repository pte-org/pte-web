"use client";

import { useMemo, useState, type ReactElement } from "react";
import {
  Alert,
  DataTable,
  PaginationControls,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import {
  useHostStudents,
  type HostStudentResponse,
  type PageMeta,
} from "../api";

const PAGE_SIZE = 20;
const EMPTY_TEXT = "-";

function display(value?: string | null): string {
  return value?.trim() ? value : EMPTY_TEXT;
}

function formatDate(value?: string | null): string {
  if (!value) return EMPTY_TEXT;
  return value.slice(0, 10);
}

function statusVariant(status: HostStudentResponse["status"]): "success" | "neutral" {
  return status === "ACTIVE" ? "success" : "neutral";
}

export const LearnersOverview = (): ReactElement => {
  const [page, setPage] = useState(0);
  const studentsQuery = useHostStudents(page, PAGE_SIZE);

  const columns = useMemo<DataTableColumn<HostStudentResponse>[]>(
    () => [
      {
        key: "username",
        header: "Username",
        cell: (student) => (
          <span className="font-medium text-gray-900">{student.username}</span>
        ),
      },
      {
        key: "fullName",
        header: "Full name",
        cell: (student) => display(student.fullName),
      },
      {
        key: "studentCode",
        header: "Student code",
        cell: (student) => display(student.studentCode),
      },
      {
        key: "className",
        header: "Class",
        cell: (student) => display(student.className),
      },
      {
        key: "phone",
        header: "Phone",
        cell: (student) => display(student.phone),
      },
      {
        key: "createdAt",
        header: "Created",
        cell: (student) => formatDate(student.createdAt),
      },
      {
        key: "status",
        header: "Status",
        cell: (student) => (
          <StatusBadge
            label={student.status}
            variant={statusVariant(student.status)}
          />
        ),
      },
    ],
    [],
  );

  const pageMeta = studentsQuery.data?.meta as PageMeta | undefined;
  const rows = studentsQuery.data?.data ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900">Learners</h2>
        <p className="text-sm text-gray-600">
          Manage learners imported for your organization.
        </p>
      </div>

      {studentsQuery.error && (
        <Alert tone="error" title="Unable to load learners">
          {studentsQuery.error instanceof Error
            ? studentsQuery.error.message
            : "Please try again."}
        </Alert>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Total learners: {pageMeta?.totalElements.toLocaleString() ?? 0}
        </span>
        <span>
          Page {page + 1} of {Math.max(pageMeta?.totalPages ?? 1, 1)}
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(student) => student.id}
        isLoading={studentsQuery.isLoading}
        emptyTitle="No learners yet"
        emptyDescription="Imported learners will appear here after confirmation."
      />

      {pageMeta && pageMeta.totalPages > 1 && (
        <PaginationControls
          meta={pageMeta}
          onPageChange={setPage}
          disabled={studentsQuery.isFetching}
        />
      )}
    </section>
  );
};
