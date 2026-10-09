"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  CollapsibleSection,
  DataTable,
  Select,
  TrashIcon,
  cn,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import type { ProctorRole } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  PROCTOR_ROLE_DESCRIPTIONS,
  PROCTOR_ROLE_LABELS,
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
  const { t } = useLocale();
  const { data: assignments, isLoading } = useProctorAssignments(sessionPublicId);
  const unassign = useUnassignProctor(sessionPublicId);
  const updateRole = useUpdateProctorRole(sessionPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);
  const updateRoleError = errorMessage(updateRole.error);
  const text = {
    section: t("tenant.participants.proctors", SESSION_DETAIL_TEXT.PROCTORS_SECTION),
    assign: t("tenant.proctor.assign", T.ASSIGN_PROCTOR),
    empty: t("tenant.proctor.empty", T.EMPTY_TITLE),
    unassign: t("tenant.proctor.unassign", T.UNASSIGN),
    assignedCount: (count: number) =>
      t("tenant.proctor.assignedCount", T.ASSIGNED_COUNT, { count }),
    fullName: t("tenant.proctor.fullName", PROCTOR_TABLE_HEADERS.FULL_NAME),
    email: t("tenant.proctor.email", PROCTOR_TABLE_HEADERS.EMAIL),
    role: t("tenant.proctor.role", PROCTOR_TABLE_HEADERS.ROLE),
    actions: t("tenant.proctor.actions", PROCTOR_TABLE_HEADERS.ACTIONS),
    lead: t("tenant.proctor.lead", PROCTOR_ROLE_LABELS.LEAD_PROCTOR),
    assistant: t("tenant.proctor.assistant", PROCTOR_ROLE_LABELS.ASSISTANT_PROCTOR),
    leadDescription: t("tenant.proctor.leadDescription", PROCTOR_ROLE_DESCRIPTIONS.LEAD_PROCTOR),
    assistantDescription: t(
      "tenant.proctor.assistantDescription",
      PROCTOR_ROLE_DESCRIPTIONS.ASSISTANT_PROCTOR,
    ),
  };
  const roleOptions = [
    { value: "ASSISTANT_PROCTOR", label: text.assistant },
    { value: "LEAD_PROCTOR", label: text.lead },
  ];

  const columns: DataTableColumn<ProctorAssignmentEntry>[] = [
    {
      key: "fullName",
      header: text.fullName,
      cell: (entry) => (
        <span className="font-medium text-[var(--ink-primary)]">{entry.proctor.fullName}</span>
      ),
    },
    { key: "email", header: text.email, cell: (entry) => entry.proctor.email },
    {
      key: "role",
      header: text.role,
      cell: (entry) => (
        <Select
          value={entry.role}
          title={entry.role === "LEAD_PROCTOR" ? text.leadDescription : text.assistantDescription}
          onChange={(event) =>
            updateRole.mutate({
              assignmentPublicId: entry.assignmentPublicId,
              role: event.target.value as ProctorRole,
            })
          }
          options={roleOptions}
          className={cn("w-40 font-medium", ROLE_SELECT_CLASS[entry.role])}
        />
      ),
    },
  ];

  return (
    <>
      <CollapsibleSection
        title={text.section}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-3"
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-sm text-[var(--ink-secondary)]">
              {text.assignedCount((assignments ?? []).length)}
            </span>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              + {text.assign}
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
          emptyTitle={text.empty}
          rowActionsHeader={text.actions}
          rowActions={(entry) => (
            <button
              type="button"
              onClick={() => unassign.mutate(entry.assignmentPublicId)}
              title={text.unassign}
              aria-label={text.unassign}
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
