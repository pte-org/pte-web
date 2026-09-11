"use client";

import { useEffect, useState, type ReactElement } from "react";
import { DataTable, Input, PageHeader, type DataTableColumn } from "@pte/ui";
import { STUDENT_SEARCH_TABLE_HEADERS, STUDENT_SEARCH_TEXT } from "../constants";
import { useTenantStudentSearch } from "../api";
import type { StudentSearchResult } from "../types";

const DEBOUNCE_MS = 250;

export const StudentSearchView = (): ReactElement => {
  const [input, setInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(input), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input]);

  const { results, isLoading } = useTenantStudentSearch(debouncedQuery);
  const hasQuery = debouncedQuery.trim().length > 0;

  const columns: DataTableColumn<StudentSearchResult>[] = [
    { key: "name", header: STUDENT_SEARCH_TABLE_HEADERS.NAME, cell: (row) => row.student.fullName },
    { key: "phone", header: STUDENT_SEARCH_TABLE_HEADERS.PHONE, cell: (row) => row.student.phone ?? "—" },
    {
      key: "class",
      header: STUDENT_SEARCH_TABLE_HEADERS.CLASS,
      cell: (row) => row.className ?? STUDENT_SEARCH_TEXT.unassigned,
    },
    { key: "program", header: STUDENT_SEARCH_TABLE_HEADERS.PROGRAM, cell: (row) => row.programName ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={STUDENT_SEARCH_TEXT.title} />
      <p className="text-gray-600">{STUDENT_SEARCH_TEXT.subtitle}</p>

      <Input
        aria-label={STUDENT_SEARCH_TEXT.placeholder}
        placeholder={STUDENT_SEARCH_TEXT.placeholder}
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      {hasQuery && (
        <DataTable
          columns={columns}
          rows={results}
          getRowKey={(row) => row.student.publicId}
          isLoading={isLoading}
          emptyTitle={STUDENT_SEARCH_TEXT.emptyTitle}
          emptyDescription={STUDENT_SEARCH_TEXT.emptyText}
        />
      )}
    </div>
  );
};
