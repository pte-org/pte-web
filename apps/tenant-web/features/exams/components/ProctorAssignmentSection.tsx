"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, type DataTableColumn } from "@pte/ui";
import { PROCTOR_SECTION_TEXT, PROCTOR_TABLE_HEADERS } from "../constants";
import { useProctorAssignments, useUnassignProctor } from "../api";
import type { ProctorAssignmentEntry } from "../types";
import { AssignProctorModal } from "./AssignProctorModal";

interface ProctorAssignmentSectionProps {
  sessionPublicId: string;
}

const T = PROCTOR_SECTION_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

export const ProctorAssignmentSection = ({ sessionPublicId }: ProctorAssignmentSectionProps): ReactElement => {
  const { data: assignments, isLoading } = useProctorAssignments(sessionPublicId);
  const unassign = useUnassignProctor(sessionPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);

  const columns: DataTableColumn<ProctorAssignmentEntry>[] = [
    {
      key: "fullName",
      header: PROCTOR_TABLE_HEADERS.FULL_NAME,
      cell: (entry) => <span className="font-medium text-gray-900">{entry.proctor.fullName}</span>,
    },
    { key: "email", header: PROCTOR_TABLE_HEADERS.EMAIL, cell: (entry) => entry.proctor.email },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {T.ASSIGNED_COUNT.replace("{count}", String((assignments ?? []).length))}
        </span>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + {T.ADD_PROCTOR}
        </button>
      </div>

      {unassignError && <Alert tone="error">{unassignError}</Alert>}

      <DataTable
        columns={columns}
        rows={assignments ?? []}
        getRowKey={(entry) => entry.assignmentPublicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        rowActions={(entry) => (
          <button
            type="button"
            onClick={() => unassign.mutate(entry.assignmentPublicId)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            {T.UNASSIGN}
          </button>
        )}
      />

      <AssignProctorModal
        key={addOpen ? "assignProctor-open" : "assignProctor-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        sessionPublicId={sessionPublicId}
        assignedProctorPublicIds={(assignments ?? []).map((entry) => entry.proctor.publicId)}
      />
    </div>
  );
};
