"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { CLASS_ROSTER_ROW_ACTIONS_TEXT, CLASS_ROSTER_TABLE_HEADERS, CLASS_ROSTER_TEXT } from "../constants";
import { useClassRoster, useUnassignStudent, type ClassRosterEntry } from "../api";
import { TransferStudentModal } from "./TransferStudentModal";

interface ClassRosterTableProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
}

interface RowActionsProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
  entry: ClassRosterEntry;
}

const RowActions = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
  entry,
}: RowActionsProps): ReactElement => {
  const [transferOpen, setTransferOpen] = useState(false);
  const unassign = useUnassignStudent(organizationPublicId, programPublicId, classPublicId);
  const unassignError = errorMessage(unassign.error);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          className="text-blue-700 hover:underline"
        >
          {CLASS_ROSTER_ROW_ACTIONS_TEXT.transfer}
        </button>
        <button
          type="button"
          disabled={unassign.isPending}
          onClick={() => unassign.mutate(entry.membership.publicId)}
          className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {CLASS_ROSTER_ROW_ACTIONS_TEXT.unassign}
        </button>
      </div>
      {unassignError && <p className="text-xs text-red-600">{unassignError}</p>}

      <TransferStudentModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={classPublicId}
        classLabel={classLabel}
        membershipPublicId={entry.membership.publicId}
        studentPublicId={entry.student.publicId}
      />
    </div>
  );
};

export const ClassRosterTable = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
}: ClassRosterTableProps): ReactElement => {
  const { data: roster, isLoading, isError, error } = useClassRoster(programPublicId, classPublicId);

  if (isError) {
    return <Alert tone="error">{errorMessage(error, CLASS_ROSTER_TEXT.loadFailed)}</Alert>;
  }

  const columns: DataTableColumn<ClassRosterEntry>[] = [
    { key: "name", header: CLASS_ROSTER_TABLE_HEADERS.FULL_NAME, cell: (entry) => entry.student.fullName },
    { key: "email", header: CLASS_ROSTER_TABLE_HEADERS.EMAIL, cell: (entry) => entry.student.email },
    { key: "phone", header: CLASS_ROSTER_TABLE_HEADERS.PHONE, cell: (entry) => entry.student.phone ?? "—" },
    {
      key: "actions",
      header: CLASS_ROSTER_TABLE_HEADERS.ACTIONS,
      cell: (entry) => (
        <RowActions
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={classPublicId}
          classLabel={classLabel}
          entry={entry}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={roster ?? []}
      getRowKey={(entry) => entry.membership.publicId}
      isLoading={isLoading}
      emptyTitle={CLASS_ROSTER_TEXT.emptyTitle}
      emptyDescription={CLASS_ROSTER_TEXT.emptyText}
    />
  );
};
