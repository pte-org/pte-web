"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  DataTable,
  Select,
  TrashIcon,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
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
  const { t } = useLocale();
  const { data: assignedClasses, isLoading } = useAssignedClasses(sessionPublicId);
  const { data: tenantClasses, isLoading: tenantClassesLoading } = useAllTenantClasses();
  const assign = useAssignClass(sessionPublicId);
  const unassign = useUnassignClass(sessionPublicId);
  const [selectedClassPublicId, setSelectedClassPublicId] = useState("");
  const text = {
    empty: t("tenant.classAssignment.empty", T.EMPTY_TITLE),
    label: t("tenant.classAssignment.label", T.ASSIGN_LABEL),
    placeholder: t("tenant.classAssignment.placeholder", T.ASSIGN_PLACEHOLDER),
    assign: t("tenant.classAssignment.assign", T.ASSIGN),
    assigning: t("tenant.classAssignment.assigning", T.ASSIGNING),
    sourceLocked: t("tenant.classAssignment.sourceLocked", T.SOURCE_LOCKED),
    unassign: t("tenant.classAssignment.unassign", T.UNASSIGN),
    actions: t("tenant.classAssignment.actions", T.ACTIONS),
    notScheduled: t("tenant.classAssignment.notScheduled", T.NOT_SCHEDULED_NOTICE),
  };

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
      header: text.label,
      cell: (entry) => (
        <span className="font-medium text-[var(--ink-primary)]">
          {entry.className}{" "}
          <span className="text-[var(--ink-secondary)]">({entry.programName})</span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {!canModify && <Alert tone="warning">{text.notScheduled}</Alert>}
      {errorMessage(assign.error) && <Alert tone="error">{errorMessage(assign.error)}</Alert>}
      {errorMessage(unassign.error) && <Alert tone="error">{errorMessage(unassign.error)}</Alert>}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Select
            label={text.label}
            placeholder={text.placeholder}
            options={availableOptions}
            value={selectedClassPublicId}
            disabled={!canModify || tenantClassesLoading}
            onChange={(event) => setSelectedClassPublicId(event.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={handleAssign}
          disabled={!canModify || !selectedClassPublicId || assign.isPending}
          isLoading={assign.isPending}
          loadingText={text.assigning}
          title={!canModify ? text.sourceLocked : undefined}
        >
          {text.assign}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={assignedClasses ?? []}
        getRowKey={(entry) => entry.classPublicId}
        isLoading={isLoading}
        emptyTitle={text.empty}
        rowActionsHeader={canModify ? text.actions : undefined}
        rowActions={
          canModify
            ? (entry) => (
                <button
                  type="button"
                  onClick={() => unassign.mutate(entry.classPublicId)}
                  title={text.unassign}
                  aria-label={text.unassign}
                  className="rounded-full p-1.5 text-[var(--blush-action)] transition-colors hover:bg-[var(--blush-tint)] hover:text-[var(--blush-action)]"
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
