"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, DataTable, Select, TrashIcon, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useAllTenantClasses } from "@/features/classes/api";
import { CLASS_ASSIGNMENT_TEXT } from "../constants";
import { useAssignClass, useAssignedClasses, useUnassignClass } from "../api";
import type { AssignedClass } from "../types";

interface ClassAssignmentSectionProps {
  sessionPublicId: string;
  /** Assign/unassign is only allowed while the session is SCHEDULED (backend Phase 4). */
  canModify: boolean;
}

const T = CLASS_ASSIGNMENT_TEXT;

export const ClassAssignmentSection = ({
  sessionPublicId,
  canModify,
}: ClassAssignmentSectionProps): ReactElement => {
  const { data: assignedClasses, isLoading } = useAssignedClasses(sessionPublicId);
  const { data: tenantClasses, isLoading: tenantClassesLoading } = useAllTenantClasses();
  const assign = useAssignClass(sessionPublicId);
  const unassign = useUnassignClass(sessionPublicId);
  const [selectedClassPublicId, setSelectedClassPublicId] = useState("");

  const assignedIds = new Set((assignedClasses ?? []).map((entry) => entry.classPublicId));
  const availableOptions = (tenantClasses ?? [])
    .filter((option) => !assignedIds.has(option.classPublicId))
    .map((option) => ({
      label: `${option.className} (${option.programName})`,
      value: option.classPublicId,
    }));

  const handleAssign = (): void => {
    if (!selectedClassPublicId) return;
    assign.mutate(selectedClassPublicId, { onSuccess: () => setSelectedClassPublicId("") });
  };

  const columns: DataTableColumn<AssignedClass>[] = [
    {
      key: "className",
      header: T.ASSIGN_LABEL,
      cell: (entry) => (
        <span className="font-medium text-gray-900">
          {entry.className} <span className="text-gray-500">({entry.programName})</span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {!canModify && <Alert tone="warning">{T.NOT_SCHEDULED_NOTICE}</Alert>}
      {errorMessage(assign.error) && <Alert tone="error">{errorMessage(assign.error)}</Alert>}
      {errorMessage(unassign.error) && <Alert tone="error">{errorMessage(unassign.error)}</Alert>}

      {canModify && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select
              label={T.ASSIGN_LABEL}
              placeholder={T.ASSIGN_PLACEHOLDER}
              options={availableOptions}
              value={selectedClassPublicId}
              disabled={tenantClassesLoading}
              onChange={(event) => setSelectedClassPublicId(event.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedClassPublicId || assign.isPending}
            isLoading={assign.isPending}
            loadingText={T.ASSIGNING}
          >
            {T.ASSIGN}
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={assignedClasses ?? []}
        getRowKey={(entry) => entry.classPublicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        rowActionsHeader={canModify ? T.ACTIONS : undefined}
        rowActions={
          canModify
            ? (entry) => (
                <button
                  type="button"
                  onClick={() => unassign.mutate(entry.classPublicId)}
                  title={T.UNASSIGN}
                  aria-label={T.UNASSIGN}
                  className="rounded-full p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )
            : undefined
        }
      />
    </div>
  );
};
