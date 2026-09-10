"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  CLASS_ROSTER_ROW_ACTIONS_TEXT,
  CLASS_ROSTER_TABLE_HEADERS,
  CLASS_ROSTER_TEXT,
  SPLIT_CLASS_SELECTION_TEXT,
} from "../constants";
import { useClassRoster, useUnassignStudent, type ClassRosterEntry } from "../api";
import { exportClassRosterToExcel } from "../exportClassRoster";
import { TransferStudentModal } from "./TransferStudentModal";
import { SplitClassModal } from "./SplitClassModal";

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
  const [splitMode, setSplitMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [splitModalOpen, setSplitModalOpen] = useState(false);

  if (isError) {
    return <Alert tone="error">{errorMessage(error, CLASS_ROSTER_TEXT.loadFailed)}</Alert>;
  }

  const selectedStudentPublicIds = (roster ?? [])
    .filter((entry) => selectedKeys.has(entry.membership.publicId))
    .map((entry) => entry.student.publicId);

  const exitSplitMode = (): void => {
    setSplitMode(false);
    setSelectedKeys(new Set());
  };

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-3">
        {(roster ?? []).length > 0 && (
          <button
            type="button"
            onClick={() => exportClassRosterToExcel(roster ?? [], `${classLabel}-roster`)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {CLASS_ROSTER_TEXT.exportButton}
          </button>
        )}
        {!splitMode && (roster ?? []).length > 0 && (
          <button
            type="button"
            onClick={() => setSplitMode(true)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {SPLIT_CLASS_SELECTION_TEXT.startButton}
          </button>
        )}
      </div>

      {splitMode && (
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-800">{SPLIT_CLASS_SELECTION_TEXT.selectedCount(selectedKeys.size)}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={exitSplitMode} className="text-sm text-gray-600 hover:underline">
              {SPLIT_CLASS_SELECTION_TEXT.cancelSelection}
            </button>
            <button
              type="button"
              disabled={selectedKeys.size < 1}
              onClick={() => setSplitModalOpen(true)}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {SPLIT_CLASS_SELECTION_TEXT.confirmButton}
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={roster ?? []}
        getRowKey={(entry) => entry.membership.publicId}
        isLoading={isLoading}
        emptyTitle={CLASS_ROSTER_TEXT.emptyTitle}
        emptyDescription={CLASS_ROSTER_TEXT.emptyText}
        selectable={splitMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectRowLabel={(entry) => entry.student.fullName}
      />

      <SplitClassModal
        key={splitModalOpen ? "splitClass-open" : "splitClass-closed"}
        open={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        sourceClassPublicId={classPublicId}
        selectedStudentPublicIds={selectedStudentPublicIds}
        classLabel={classLabel}
        onSplit={() => {
          setSplitModalOpen(false);
          exitSplitMode();
        }}
      />
    </div>
  );
};
