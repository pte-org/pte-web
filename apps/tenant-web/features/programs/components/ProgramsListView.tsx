"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, Button, DataTable, Select, useLocale, type DataTableColumn } from "@pte/ui";
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

function formatDate(value: string | null): string {
  if (!value) return "…";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "—";
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export const ProgramsListView = (): ReactElement => {
  const labels = useOrgLabels();
  const { t } = useLocale();
  const programLabel = t("nav.program", labels.program);
  const text = {
    create: t("tenant.programs.create", PROGRAMS_TEXT.addButton),
    name: t("tenant.programs.name", PROGRAM_TABLE_HEADERS.NAME),
    status: t("tenant.programs.status", PROGRAM_TABLE_HEADERS.STATUS),
    dates: t("tenant.programs.dates", PROGRAM_TABLE_HEADERS.DATES),
    actions: t("tenant.programs.actions", PROGRAM_TABLE_HEADERS.ACTIONS),
    allStatuses: t("tenant.programs.allStatuses", "All statuses"),
    dateRange: t("tenant.programs.dateRange", "Start date range"),
    empty: t("tenant.programs.empty", PROGRAMS_TEXT.emptyTitle(labels.program)),
    emptyDescription: t(
      "tenant.programs.emptyDescription",
      PROGRAMS_TEXT.emptyText(labels.program),
    ),
    organization: t("tenant.programs.organization", PROGRAMS_TEXT.organizationLabel),
    organizationPlaceholder: t(
      "tenant.programs.organizationPlaceholder",
      PROGRAMS_TEXT.organizationPlaceholder,
    ),
    viewDetails: t("tenant.programs.viewDetails", PROGRAMS_TEXT.viewDetails),
    active: t("tenant.programs.active", PROGRAM_STATUS_LABELS.ACTIVE),
    inactive: t("tenant.programs.inactive", PROGRAM_STATUS_LABELS.INACTIVE),
    suspended: t("tenant.programs.suspended", PROGRAM_STATUS_LABELS.SUSPENDED),
  };
  const statusLabels = {
    ACTIVE: text.active,
    INACTIVE: text.inactive,
    SUSPENDED: text.suspended,
  };
  const statusFilterOptions = [
    { value: "", label: text.allStatuses },
    { value: "ACTIVE", label: text.active },
    { value: "INACTIVE", label: text.inactive },
    { value: "SUSPENDED", label: text.suspended },
  ];
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
      header: text.name,
      cell: (program) => <span className="font-medium text-gray-900">{program.name}</span>,
    },
    {
      key: "status",
      header: text.status,
      filterOptions: statusFilterOptions,
      filterAccessor: (program) => program.status,
      cell: (program) => (
        <Badge variant={PROGRAM_STATUS_VARIANT[program.status]}>
          {statusLabels[program.status] ?? program.status}
        </Badge>
      ),
    },
    {
      key: "dates",
      header: text.dates,
      filterType: "date-range",
      filterAccessor: (program) => program.startDate,
      filterPlaceholder: text.dateRange,
      cell: (program) => formatDateRange(program.startDate, program.endDate),
    },
    {
      key: "actions",
      header: text.actions,
      cell: (program) => (
        <Link
          href={`/host/programs/${program.publicId}?organizationPublicId=${organizationPublicId}`}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          {text.viewDetails}
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {organizations && organizations.length > 1 && (
        <Select
          label={text.organization}
          placeholder={text.organizationPlaceholder}
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
        emptyTitle={text.empty}
        emptyDescription={text.emptyDescription}
        toolbarActions={
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!organizationPublicId}
          >
            {text.create}
          </Button>
        }
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
        programLabel={programLabel}
      />
    </div>
  );
};
