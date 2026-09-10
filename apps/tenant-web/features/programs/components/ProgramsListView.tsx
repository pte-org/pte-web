"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, DataTable, PageHeader, Select, type DataTableColumn } from "@pte/ui";
import type { ProgramResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import {
  PROGRAM_STATUS_LABELS,
  PROGRAM_STATUS_VARIANT,
  PROGRAM_TABLE_HEADERS,
  PROGRAMS_TEXT,
} from "../constants";
import { useCreateProgram, useMyOrganizations, usePrograms } from "../api";
import type { CreateProgramInput } from "../types";
import { CreateProgramModal } from "./CreateProgramModal";

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "—";
  return `${startDate ?? "…"} – ${endDate ?? "…"}`;
}

export const ProgramsListView = (): ReactElement => {
  const labels = useOrgLabels();
  const { data: organizations, isLoading: organizationsLoading } = useMyOrganizations();
  // User's explicit pick, if any — otherwise falls back to the first loaded
  // Organization. Derived at render time (not synced via an effect) so
  // there's no cascading-render setState-in-effect footgun.
  const [selectedOrganizationPublicId, setOrganizationPublicId] = useState("");
  const organizationPublicId = selectedOrganizationPublicId || organizations?.[0]?.publicId || "";

  const { data: programs, isLoading: programsLoading } = usePrograms(organizationPublicId);
  const create = useCreateProgram(organizationPublicId);
  const [createOpen, setCreateOpen] = useState(false);

  const confirmCreate = (input: CreateProgramInput): void => {
    create.mutate(
      {
        name: input.name.trim(),
        description: input.description.trim() || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const createErrorMessage = errorMessage(create.error);

  const columns: DataTableColumn<ProgramResponse>[] = [
    {
      key: "name",
      header: PROGRAM_TABLE_HEADERS.NAME,
      cell: (program) => (
        <Link
          href={`/host/programs/${program.publicId}?organizationPublicId=${organizationPublicId}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {program.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: PROGRAM_TABLE_HEADERS.STATUS,
      cell: (program) => (
        <Badge variant={PROGRAM_STATUS_VARIANT[program.status]}>{PROGRAM_STATUS_LABELS[program.status]}</Badge>
      ),
    },
    {
      key: "dates",
      header: PROGRAM_TABLE_HEADERS.DATES,
      cell: (program) => formatDateRange(program.startDate, program.endDate),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={labels.program}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!organizationPublicId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {PROGRAMS_TEXT.addButton(labels.program)}
          </button>
        }
      />
      <p className="text-gray-600">{PROGRAMS_TEXT.subtitle(labels.program)}</p>

      {organizations && organizations.length > 1 && (
        <Select
          label={PROGRAMS_TEXT.organizationLabel}
          placeholder={PROGRAMS_TEXT.organizationPlaceholder}
          options={organizations.map((organization) => ({
            label: organization.name,
            value: organization.publicId,
          }))}
          value={organizationPublicId}
          onChange={(event) => setOrganizationPublicId(event.target.value)}
        />
      )}

      {createErrorMessage && !createOpen && <Alert tone="error">{createErrorMessage}</Alert>}

      <DataTable
        columns={columns}
        rows={programs ?? []}
        getRowKey={(program) => program.publicId}
        isLoading={organizationsLoading || programsLoading}
        emptyTitle={PROGRAMS_TEXT.emptyTitle(labels.program)}
        emptyDescription={PROGRAMS_TEXT.emptyText(labels.program)}
      />

      <CreateProgramModal
        key={createOpen ? "createProgram-open" : "createProgram-closed"}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        error={createErrorMessage}
        isSubmitting={create.isPending}
        programLabel={labels.program}
      />
    </div>
  );
};
