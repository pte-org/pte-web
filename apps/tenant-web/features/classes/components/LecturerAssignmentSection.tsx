"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, TrashIcon, type DataTableColumn } from "@pte/ui";
import { LECTURER_SECTION_TEXT, LECTURER_TABLE_HEADERS } from "../constants";
import { useLecturerAssignments, useUnassignLecturer } from "../api";
import type { LecturerAssignmentEntry } from "../types";
import { AssignLecturerModal } from "./AssignLecturerModal";

interface LecturerAssignmentSectionProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

const T = LECTURER_SECTION_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

export const LecturerAssignmentSection = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
}: LecturerAssignmentSectionProps): ReactElement => {
  const { data: assignments, isLoading } = useLecturerAssignments(organizationPublicId, programPublicId, classPublicId);
  const unassign = useUnassignLecturer(organizationPublicId, programPublicId, classPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);

  const columns: DataTableColumn<LecturerAssignmentEntry>[] = [
    {
      key: "fullName",
      header: LECTURER_TABLE_HEADERS.FULL_NAME,
      cell: (entry) => <span className="font-medium text-gray-900">{entry.lecturer.fullName}</span>,
    },
    { key: "email", header: LECTURER_TABLE_HEADERS.EMAIL, cell: (entry) => entry.lecturer.email },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{T.assignedCount((assignments ?? []).length)}</span>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {T.addButton}
        </button>
      </div>

      {unassignError && <Alert tone="error">{unassignError}</Alert>}

      <DataTable
        columns={columns}
        rows={assignments ?? []}
        getRowKey={(entry) => entry.assignmentPublicId}
        isLoading={isLoading}
        emptyTitle={T.emptyTitle}
        rowActionsHeader={LECTURER_TABLE_HEADERS.ACTIONS}
        rowActions={(entry) => (
          <button
            type="button"
            onClick={() => unassign.mutate(entry.assignmentPublicId)}
            title={T.unassign}
            aria-label={T.unassign}
            className="rounded-full p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      />

      <AssignLecturerModal
        key={addOpen ? "assignLecturer-open" : "assignLecturer-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={classPublicId}
        assignedLecturerPublicIds={(assignments ?? []).map((entry) => entry.lecturer.publicId)}
      />
    </div>
  );
};
