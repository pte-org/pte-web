"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, TrashIcon, type DataTableColumn } from "@pte/ui";
import { COORDINATOR_SECTION_TEXT, COORDINATOR_TABLE_HEADERS } from "../constants";
import { useCoordinatorAssignments, useUnassignCoordinator } from "../api";
import type { CoordinatorAssignmentEntry } from "../types";
import { AssignCoordinatorModal } from "./AssignCoordinatorModal";

interface CoordinatorAssignmentSectionProps {
  organizationPublicId: string;
  programPublicId: string;
}

const T = COORDINATOR_SECTION_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

export const CoordinatorAssignmentSection = ({
  organizationPublicId,
  programPublicId,
}: CoordinatorAssignmentSectionProps): ReactElement => {
  const { data: assignments, isLoading } = useCoordinatorAssignments(organizationPublicId, programPublicId);
  const unassign = useUnassignCoordinator(organizationPublicId, programPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);

  const columns: DataTableColumn<CoordinatorAssignmentEntry>[] = [
    {
      key: "fullName",
      header: COORDINATOR_TABLE_HEADERS.FULL_NAME,
      cell: (entry) => <span className="font-medium text-gray-900">{entry.coordinator.fullName}</span>,
    },
    { key: "email", header: COORDINATOR_TABLE_HEADERS.EMAIL, cell: (entry) => entry.coordinator.email },
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
        rowActionsHeader={COORDINATOR_TABLE_HEADERS.ACTIONS}
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

      <AssignCoordinatorModal
        key={addOpen ? "assignCoordinator-open" : "assignCoordinator-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        assignedCoordinatorPublicIds={(assignments ?? []).map((entry) => entry.coordinator.publicId)}
      />
    </div>
  );
};
