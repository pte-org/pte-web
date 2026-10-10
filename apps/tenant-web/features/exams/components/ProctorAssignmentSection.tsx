"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  CollapsibleSection,
  DataTable,
  Select,
  TrashIcon,
  cn,
  type DataTableColumn,
} from "@pte/ui";
import type { ProctorRole } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  PROCTOR_ROLE_DESCRIPTIONS,
  PROCTOR_ROLE_OPTIONS,
  PROCTOR_SECTION_TEXT,
  PROCTOR_TABLE_HEADERS,
  SESSION_DETAIL_TEXT,
} from "../constants";
import { useProctorAssignments, useUnassignProctor, useUpdateProctorRole } from "../api";
import type { ProctorAssignmentEntry } from "../types";
import { AssignProctorModal } from "./AssignProctorModal";

interface ProctorAssignmentSectionProps {
  sessionPublicId: string;
}

const T = PROCTOR_SECTION_TEXT;

const ROLE_SELECT_CLASS: Record<ProctorRole, string> = {
  LEAD_PROCTOR:
    "border-[var(--brand-soft)] bg-[var(--brand-tint)] text-[var(--brand-ink)] focus:ring-[var(--brand)]",
  ASSISTANT_PROCTOR:
    "border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] focus:ring-[var(--brand)]",
};

export const ProctorAssignmentSection = ({
  sessionPublicId,
}: ProctorAssignmentSectionProps): ReactElement => {
  const { data: assignments, isLoading } = useProctorAssignments(sessionPublicId);
  const unassign = useUnassignProctor(sessionPublicId);
  const updateRole = useUpdateProctorRole(sessionPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);
  const updateRoleError = errorMessage(updateRole.error);

  const columns: DataTableColumn<ProctorAssignmentEntry>[] = [
    {
      key: "fullName",
      header: PROCTOR_TABLE_HEADERS.FULL_NAME,
      cell: (entry) => (
        <span className="font-medium text-[var(--ink-primary)]">{entry.proctor.fullName}</span>
      ),
    },
    { key: "email", header: PROCTOR_TABLE_HEADERS.EMAIL, cell: (entry) => entry.proctor.email },
    {
      key: "role",
      header: PROCTOR_TABLE_HEADERS.ROLE,
      cell: (entry) => (
        <Select
          value={entry.role}
          title={PROCTOR_ROLE_DESCRIPTIONS[entry.role]}
          onChange={(event) =>
            updateRole.mutate({
              assignmentPublicId: entry.assignmentPublicId,
              role: event.target.value as ProctorRole,
            })
          }
          options={PROCTOR_ROLE_OPTIONS}
          className={cn("w-40 font-medium", ROLE_SELECT_CLASS[entry.role])}
        />
      ),
    },
  ];

  return (
    <>
      <CollapsibleSection
        title={SESSION_DETAIL_TEXT.PROCTORS_SECTION}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-3"
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-sm text-[var(--ink-secondary)]">
              {T.ASSIGNED_COUNT.replace("{count}", String((assignments ?? []).length))}
            </span>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              + {T.ASSIGN_PROCTOR}
            </button>
          </div>
        }
      >
        {unassignError && <Alert tone="error">{unassignError}</Alert>}
        {updateRoleError && <Alert tone="error">{updateRoleError}</Alert>}

        <DataTable
          columns={columns}
          rows={assignments ?? []}
          getRowKey={(entry) => entry.assignmentPublicId}
          isLoading={isLoading}
          emptyTitle={T.EMPTY_TITLE}
          rowActionsHeader={PROCTOR_TABLE_HEADERS.ACTIONS}
          rowActions={(entry) => (
            <button
              type="button"
              onClick={() => unassign.mutate(entry.assignmentPublicId)}
              title={T.UNASSIGN}
              aria-label={T.UNASSIGN}
              className="rounded-full p-1.5 text-[var(--blush-action)] transition-colors hover:bg-[var(--blush-tint)] hover:text-[var(--blush-action)]"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        />
      </CollapsibleSection>

      <AssignProctorModal
        key={addOpen ? "assignProctor-open" : "assignProctor-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        sessionPublicId={sessionPublicId}
        assignedProctorPublicIds={(assignments ?? []).map((entry) => entry.proctor.publicId)}
      />
    </>
  );
};
