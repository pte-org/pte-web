"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Badge,
  Button,
  DataTable,
  EyeIcon,
  Select,
  useLocale,
  useToast,
  type DataTableColumn,
} from "@pte/ui";
import type { ProgramResponse } from "@pte/api-client";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import {
  PROGRAM_STATUS_LABELS,
  PROGRAM_STATUS_VARIANT,
  PROGRAM_TABLE_HEADERS,
  PROGRAMS_TEXT,
} from "../constants";
import { useCreateProgram, useMyOrganizations, usePrograms } from "../api";
import type { CreateProgramInput } from "../types";
import { formatProgramDateRange } from "../utils/formatProgramDates";
import { programErrorMessage } from "../utils/programErrorMessage";
import { CreateProgramModal } from "./CreateProgramModal";

export const ProgramsListView = (): ReactElement => {
  const labels = useOrgLabels();
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const searchText = useTenantSearchText("programs");
  const router = useRouter();
  const programLabel = t("nav.program", labels.program);
  const labelValues = { program: programLabel, programLower: programLabel.toLowerCase() };
  const text = {
    create: t("tenant.programs.create", PROGRAMS_TEXT.addButton),
    createSuccess: t(
      "tenant.programs.createSuccess",
      PROGRAMS_TEXT.createSuccess(programLabel),
      { program: programLabel, programLower: programLabel.toLowerCase() },
    ),
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
    ongoing: t("tenant.programs.ongoing", locale === "vi" ? "Không giới hạn" : "Ongoing"),
  };
  const dateRangeText = {
    ongoing: text.ongoing,
    untilDate: (date: string) =>
      t("tenant.programs.untilDate", locale === "vi" ? "Đến {date}" : "Until {date}", { date }),
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
      {
        onSuccess: () => {
          setCreateOpen(false);
          showToast(text.createSuccess, { tone: "success" });
        },
      },
    );
  };

  const createErrorMessage = programErrorMessage(create.error, locale, {
    nameAlreadyUsed: t(
      "tenant.programs.errorNameAlreadyUsed",
      "A {programLower} with this name already exists in your organization.",
      labelValues,
    ),
    programNotFound: t(
      "tenant.programs.errorProgramNotFound",
      "The selected {programLower} could not be found or is no longer active.",
      labelValues,
    ),
    organizationNotFound: t(
      "tenant.programs.errorOrganizationNotFound",
      "The selected organization could not be found.",
    ),
    network: t(
      "tenant.programs.errorNetwork",
      "Unable to connect to the server. Please check your connection and try again.",
    ),
    generic: t(
      "tenant.programs.errorGeneric",
      "We couldn't complete this action. Please try again.",
    ),
    nameRequired: t("tenant.programs.nameRequired", "{program} name is required.", labelValues),
    endDateBeforeStartDate: t(
      "tenant.programs.endDateBeforeStartDate",
      "End date must be on or after the start date.",
    ),
  });

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
      cell: (program) => formatProgramDateRange(program.startDate, program.endDate, dateRangeText),
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
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        rowActionsHeader={text.actions}
        rowActions={(program) => (
          <ActionMenu
            label={`${text.actions}: ${program.name}`}
            items={[
              {
                label: text.viewDetails,
                icon: EyeIcon,
                onSelect: () =>
                  router.push(
                    `/host/programs/${program.publicId}?organizationPublicId=${organizationPublicId}`,
                  ),
              },
            ]}
          />
        )}
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
