"use client";

import { useState, type ReactElement } from "react";
import { ActionMenu, Alert, Button, DataTable, TrashIcon, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useClassActionText } from "../hooks/useClassActionText";
import { useLecturerAssignments, useUnassignLecturer } from "../api";
import type { LecturerAssignmentEntry } from "../types";
import { AssignLecturerModal } from "./AssignLecturerModal";

interface LecturerAssignmentSectionProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}


export const LecturerAssignmentSection = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
}: LecturerAssignmentSectionProps): ReactElement => {
  const T = useClassActionText();
  const searchText = useTenantSearchText("lecturers");
  const { data: assignments, isLoading } = useLecturerAssignments(
    organizationPublicId,
    programPublicId,
    classPublicId,
  );
  const unassign = useUnassignLecturer(organizationPublicId, programPublicId, classPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);

  const columns: DataTableColumn<LecturerAssignmentEntry>[] = [
    {
      key: "fullName",
      header: T.fullName,
      cell: (entry) => <span className="font-medium text-gray-900">{entry.lecturer.fullName}</span>,
    },
    { key: "email", header: T.email, cell: (entry) => entry.lecturer.email },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-[var(--ink-secondary)]">{T.format("assignedLecturers", { count: (assignments ?? []).length })}</span>
        <Button onClick={() => setAddOpen(true)}>{T.addLecturer}</Button>
      </div>

      {unassignError && <Alert tone="error">{unassignError}</Alert>}

      <DataTable
        columns={columns}
        rows={assignments ?? []}
        getRowKey={(entry) => entry.assignmentPublicId}
        isLoading={isLoading}
        emptyTitle={T.emptyLecturers}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        rowActionsHeader={T.actions}
        rowActions={(entry) => (
          <ActionMenu
            label={`${T.actions}: ${entry.lecturer.fullName}`}
            items={[
              {
                label: T.unassign,
                icon: TrashIcon,
                danger: true,
                onSelect: () => unassign.mutate(entry.assignmentPublicId),
              },
            ]}
          />
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
