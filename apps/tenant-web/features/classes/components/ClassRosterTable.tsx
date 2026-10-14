"use client";

import { useState, type ReactElement } from "react";
import { ActionMenu, Alert, Button, ConfirmDialog, DataTable, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useClassActionText } from "../hooks/useClassActionText";
import {
  CLASS_ROSTER_ROW_ACTIONS_TEXT,
  CLASS_ROSTER_TABLE_HEADERS,
  CLASS_ROSTER_TEXT,
  SPLIT_CLASS_SELECTION_TEXT,
} from "../constants";
import { CLASS_ROSTER_UNASSIGN_CONFIRM_TEXT } from "../constants/confirmText";
import { useClassRoster, useUnassignStudent, type ClassRosterEntry } from "../api";
import { exportClassRosterToExcel } from "../exportClassRoster";
import { TransferStudentModal } from "./TransferStudentModal";
import { SplitClassModal } from "./SplitClassModal";

interface ClassRosterTableProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
  /** Concrete class name, named in the unassign confirmation (AC3). */
  className: string;
  onAddStudents: () => void;
}

interface RowActionsProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
  className: string;
  entry: ClassRosterEntry;
}

const U = CLASS_ROSTER_UNASSIGN_CONFIRM_TEXT;

const RowActions = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
  className,
  entry,
}: RowActionsProps): ReactElement => {
  const [transferOpen, setTransferOpen] = useState(false);
  const [unassignConfirmOpen, setUnassignConfirmOpen] = useState(false);
  const unassign = useUnassignStudent(organizationPublicId, programPublicId, classPublicId);
  const unassignError = errorMessage(unassign.error);

  const handleUnassignConfirm = (): void => {
    unassign.mutate(entry.membership.publicId, {
      onSettled: () => setUnassignConfirmOpen(false),
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <ActionMenu
        label={`${CLASS_ROSTER_TABLE_HEADERS.ACTIONS}: ${entry.student.fullName}`}
        items={[
          {
            label: CLASS_ROSTER_ROW_ACTIONS_TEXT.transfer,
            onSelect: () => setTransferOpen(true),
          },
          { separator: true, key: "roster-danger-divider" },
          {
            label: CLASS_ROSTER_ROW_ACTIONS_TEXT.unassign,
            danger: true,
            disabled: unassign.isPending,
            onSelect: () => setUnassignConfirmOpen(true),
          },
        ]}
      />
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

      <ConfirmDialog
        open={unassignConfirmOpen}
        title={U.title}
        description={U.description(entry.student.fullName, className)}
        confirmLabel={U.confirmButton}
        cancelLabel={U.cancel}
        tone="danger"
        isConfirming={unassign.isPending}
        onConfirm={handleUnassignConfirm}
        onClose={() => setUnassignConfirmOpen(false)}
      />
    </div>
  );
};

export const ClassRosterTable = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
  className,
  onAddStudents,
}: ClassRosterTableProps): ReactElement => {
  const text = useClassActionText();
  const searchText = useTenantSearchText("roster");
  const {
    data: roster,
    isLoading,
    isError,
    error,
  } = useClassRoster(programPublicId, classPublicId);
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
    {
      key: "name",
      header: text.fullName,
      cell: (entry) => entry.student.fullName,
    },
    {
      key: "email",
      header: text.email,
      cell: (entry) => entry.student.email,
    },
    {
      key: "phone",
      header: text.phone,
      cell: (entry) => entry.student.phone ?? CLASS_ROSTER_TEXT.emptyValue,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {splitMode && (
        <div className="flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <span className="text-sm text-blue-800">
            {SPLIT_CLASS_SELECTION_TEXT.selectedCount(selectedKeys.size)}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exitSplitMode}
              className="text-sm text-gray-600 hover:underline"
            >
              {SPLIT_CLASS_SELECTION_TEXT.cancelSelection}
            </button>
            <button
              type="button"
              disabled={selectedKeys.size < 1}
              onClick={() => setSplitModalOpen(true)}
              className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
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
        emptyTitle={text.rosterEmpty}
        emptyDescription={text.rosterDescription}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        toolbarActions={
          <>
            {(roster ?? []).length > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => exportClassRosterToExcel(roster ?? [], `${classLabel}-roster`)}
              >
                {CLASS_ROSTER_TEXT.exportButton}
              </Button>
            )}
            {!splitMode && (roster ?? []).length > 0 && (
              <Button type="button" variant="secondary" onClick={() => setSplitMode(true)}>
                {SPLIT_CLASS_SELECTION_TEXT.startButton}
              </Button>
            )}
            <Button type="button" onClick={onAddStudents}>
              {text.addStudents}
            </Button>
          </>
        }
        rowActionsHeader={text.actions}
        rowActions={(entry) => (
          <RowActions
            organizationPublicId={organizationPublicId}
            programPublicId={programPublicId}
            classPublicId={classPublicId}
            classLabel={classLabel}
            className={className}
            entry={entry}
          />
        )}
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
