"use client";

import { useState, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  Button,
  CollapsibleSection,
  DataTable,
  TrashIcon,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import {
  PROCTOR_SECTION_TEXT,
  PROCTOR_TABLE_HEADERS,
  SESSION_DETAIL_TEXT,
} from "../constants";
import { useProctorAssignments, useUnassignProctor } from "../api";
import type { ProctorAssignmentEntry } from "../types";
import { AssignProctorModal } from "./AssignProctorModal";

interface ProctorAssignmentSectionProps {
  sessionPublicId: string;
}

const T = PROCTOR_SECTION_TEXT;

export const ProctorAssignmentSection = ({
  sessionPublicId,
}: ProctorAssignmentSectionProps): ReactElement => {
  const { t } = useLocale();
  const searchText = useTenantSearchText("proctors");
  const { data: assignments, isLoading } = useProctorAssignments(sessionPublicId);
  const unassign = useUnassignProctor(sessionPublicId);
  const [addOpen, setAddOpen] = useState(false);

  const unassignError = errorMessage(unassign.error);
  const text = {
    section: t("tenant.participants.proctors", SESSION_DETAIL_TEXT.PROCTORS_SECTION),
    assign: t("tenant.proctor.assign", T.ASSIGN_PROCTOR),
    empty: t("tenant.proctor.empty", T.EMPTY_TITLE),
    unassign: t("tenant.proctor.unassign", T.UNASSIGN),
    fullName: t("tenant.proctor.fullName", PROCTOR_TABLE_HEADERS.FULL_NAME),
    email: t("tenant.proctor.email", PROCTOR_TABLE_HEADERS.EMAIL),
    actions: t("tenant.proctor.actions", PROCTOR_TABLE_HEADERS.ACTIONS),
  };

  const columns: DataTableColumn<ProctorAssignmentEntry>[] = [
    {
      key: "fullName",
      header: text.fullName,
      cell: (entry) => (
        <span className="font-medium text-[var(--ink-primary)]">{entry.proctor.fullName}</span>
      ),
    },
    { key: "email", header: text.email, cell: (entry) => entry.proctor.email },
  ];

  return (
    <>
      <CollapsibleSection
        title={text.section}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-3"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            {text.assign}
          </Button>
        }
      >
        {unassignError && <Alert tone="error">{unassignError}</Alert>}

        <DataTable
          columns={columns}
          rows={assignments ?? []}
          getRowKey={(entry) => entry.assignmentPublicId}
          isLoading={isLoading}
          emptyTitle={text.empty}
          searchPlaceholder={searchText.placeholder}
          searchAriaLabel={searchText.ariaLabel}
          rowActionsHeader={text.actions}
          rowActions={(entry) => (
            <ActionMenu
              label={`${text.actions}: ${entry.proctor.fullName}`}
              items={[
                {
                  label: text.unassign,
                  icon: TrashIcon,
                  danger: true,
                  onSelect: () => unassign.mutate(entry.assignmentPublicId),
                },
              ]}
            />
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
