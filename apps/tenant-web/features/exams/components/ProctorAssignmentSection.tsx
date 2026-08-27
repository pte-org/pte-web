"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, ShieldIcon, TrashIcon, UsersIcon, cn, type DataTableColumn } from "@pte/ui";
import type { ProctorRole } from "@pte/api-client";
import {
  PROCTOR_ROLE_DESCRIPTIONS,
  PROCTOR_ROLE_OPTIONS,
  PROCTOR_SECTION_TEXT,
  PROCTOR_TABLE_HEADERS,
} from "../constants";
import { useProctorAssignments, useUnassignProctor, useUpdateProctorRole } from "../api";
import type { ProctorAssignmentEntry } from "../types";
import { AssignProctorModal } from "./AssignProctorModal";

interface ProctorAssignmentSectionProps {
  sessionPublicId: string;
}

const T = PROCTOR_SECTION_TEXT;

const ROLE_ACCENT: Record<ProctorRole, { icon: typeof ShieldIcon; select: string; iconBg: string }> = {
  LEAD_PROCTOR: {
    icon: ShieldIcon,
    select: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500",
    iconBg: "bg-blue-100 text-blue-600",
  },
  ASSISTANT_PROCTOR: {
    icon: UsersIcon,
    select: "border-gray-200 bg-white text-gray-700 focus:ring-blue-500",
    iconBg: "bg-slate-200 text-slate-600",
  },
};

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

export const ProctorAssignmentSection = ({ sessionPublicId }: ProctorAssignmentSectionProps): ReactElement => {
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
      cell: (entry) => <span className="font-medium text-gray-900">{entry.proctor.fullName}</span>,
    },
    { key: "email", header: PROCTOR_TABLE_HEADERS.EMAIL, cell: (entry) => entry.proctor.email },
    {
      key: "role",
      header: PROCTOR_TABLE_HEADERS.ROLE,
      cell: (entry) => (
        <select
          value={entry.role}
          title={PROCTOR_ROLE_DESCRIPTIONS[entry.role]}
          onChange={(event) =>
            updateRole.mutate({ assignmentPublicId: entry.assignmentPublicId, role: event.target.value as ProctorRole })
          }
          className={cn(
            "w-40 cursor-pointer rounded-md border px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus:ring-2",
            ROLE_ACCENT[entry.role].select,
          )}
        >
          {PROCTOR_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {T.ASSIGNED_COUNT.replace("{count}", String((assignments ?? []).length))}
        </span>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + {T.ADD_PROCTOR}
        </button>
      </div>

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
            className="rounded-full p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{T.ROLES_LEGEND_TITLE}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          {PROCTOR_ROLE_OPTIONS.map((option) => {
            const accent = ROLE_ACCENT[option.value];
            const Icon = accent.icon;
            return (
              <div key={option.value} className="flex gap-3">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", accent.iconBg)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <dt className="text-sm font-semibold text-gray-900">{option.label}</dt>
                  <dd className="text-sm text-gray-500">{PROCTOR_ROLE_DESCRIPTIONS[option.value]}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <AssignProctorModal
        key={addOpen ? "assignProctor-open" : "assignProctor-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        sessionPublicId={sessionPublicId}
        assignedProctorPublicIds={(assignments ?? []).map((entry) => entry.proctor.publicId)}
      />
    </div>
  );
};
