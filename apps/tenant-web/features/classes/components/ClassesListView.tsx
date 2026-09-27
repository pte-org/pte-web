"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  DataTable,
  PageHeader,
  Select,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useAllTenantClasses, type TenantClassOption } from "../api";
import {
  CLASSES_LIST_TEXT,
  CLASS_ROW_ACTIONS_TEXT,
  CLASS_STATUS_LABELS,
  CLASS_STATUS_VARIANT,
  CLASS_TABLE_HEADERS,
} from "../constants";

const ALL_FILTER = "ALL";

interface ClassRowActionsProps {
  option: TenantClassOption;
}

const ClassRowActions = ({ option }: ClassRowActionsProps): ReactElement => {
  // Status mutations are scoped per class — same wiring as ClassesSection.
  // Lazy-imported here via re-evaluated hook call would be unusual; we
  // rely on the hook's internal `enabled` flag pattern instead.
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href={`/host/programs/${option.programPublicId}/classes/${option.classPublicId}?organizationPublicId=${option.organizationPublicId}`}
        className="font-medium text-blue-700 hover:underline"
      >
        {CLASS_ROW_ACTIONS_TEXT.edit}
      </Link>
    </div>
  );
};

export const ClassesListView = (): ReactElement => {
  const labels = useOrgLabels();
  const { data: classes, isLoading, isError, error } = useAllTenantClasses();
  const [programFilter, setProgramFilter] = useState<string>(ALL_FILTER);

  const programOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of classes ?? []) {
      if (!seen.has(c.programPublicId)) seen.set(c.programPublicId, c.programName);
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const list = classes ?? [];
    if (programFilter === ALL_FILTER) return list;
    return list.filter((c) => c.programPublicId === programFilter);
  }, [classes, programFilter]);

  if (isError) {
    return (
      <Alert tone="error">
        {errorMessage(error) ?? `Couldn't load ${labels.class.toLowerCase()}s.`}
      </Alert>
    );
  }

  // Empty state: distinguish "0 programs" vs "0 classes but has programs".
  // We can tell from `programOptions` — if the fan-out finished and there
  // are still no program entries, the tenant has 0 programs.
  const tenantHasNoPrograms = !isLoading && (classes ?? []).length === 0 && programOptions.length === 0;

  if (tenantHasNoPrograms) {
    return (
      <div className="flex flex-col gap-5 p-2">
        <PageHeader title={labels.class} />
        <p className="text-gray-600">
          {CLASSES_LIST_TEXT.emptyNoProgramsDescription(labels.program, labels.class)}
        </p>
        <Link
          href="/host/programs"
          className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
        >
          {CLASSES_LIST_TEXT.emptyNoProgramsCta(labels.program)}
        </Link>
      </div>
    );
  }

  if (!isLoading && (classes ?? []).length === 0 && programOptions.length >= 2) {
    return (
      <NoClassesMultiProgram
        programOptions={programOptions}
        classLabel={labels.class}
        programLabel={labels.program}
      />
    );
  }

  if (!isLoading && (classes ?? []).length === 0 && programOptions.length === 1) {
    const only = programOptions[0];
    return (
      <div className="flex flex-col gap-5 p-2">
        <PageHeader title={labels.class} />
        <p className="text-gray-600">{CLASSES_LIST_TEXT.emptyNoClassesTitle(labels.class)}</p>
        <Link
          href={`/host/programs/${only.value}/classes`}
          className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
        >
          {CLASSES_LIST_TEXT.emptyNoClassesDirectCta(only.label, labels.class)}
        </Link>
      </div>
    );
  }

  const columns: DataTableColumn<TenantClassOption>[] = [
    {
      key: "name",
      header: CLASS_TABLE_HEADERS.NAME,
      cell: (option) => (
        <Link
          href={`/host/programs/${option.programPublicId}/classes/${option.classPublicId}?organizationPublicId=${option.organizationPublicId}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {option.className}
        </Link>
      ),
    },
    {
      key: "program",
      header: CLASS_TABLE_HEADERS.PROGRAM,
      cell: (option) => option.programName,
    },
    {
      key: "students",
      header: CLASSES_LIST_TEXT.studentCountPlaceholder,
      cell: () => CLASSES_LIST_TEXT.studentCountPlaceholder,
    },
    {
      key: "status",
      header: CLASS_TABLE_HEADERS.STATUS,
      cell: (option) => (
        <Badge variant={CLASS_STATUS_VARIANT[option.status]}>
          {CLASS_STATUS_LABELS[option.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: CLASS_TABLE_HEADERS.ACTIONS,
      cell: (option) => <ClassRowActions option={option} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={labels.class} />
      <p className="text-gray-600">
        {CLASSES_LIST_TEXT.subtitle(labels.class, labels.program)}
      </p>

      {programOptions.length >= 2 && (
        <Select
          label={CLASSES_LIST_TEXT.programFilterLabel(labels.program)}
          options={[
            { value: ALL_FILTER, label: CLASSES_LIST_TEXT.programFilterAll(labels.program) },
            ...programOptions,
          ]}
          value={programFilter}
          onChange={(event) => setProgramFilter(event.target.value)}
        />
      )}

      <p className="text-sm text-gray-500">
        {CLASSES_LIST_TEXT.countLabel(filteredClasses.length, labels.class)}
      </p>

      <DataTable
        columns={columns}
        rows={filteredClasses}
        getRowKey={(option) => option.classPublicId}
        isLoading={isLoading}
        emptyTitle={CLASSES_LIST_TEXT.emptyNoClassesTitle(labels.class)}
        emptyDescription={CLASSES_LIST_TEXT.subtitle(labels.class, labels.program)}
      />
    </div>
  );
};

interface NoClassesMultiProgramProps {
  programOptions: { value: string; label: string }[];
  classLabel: string;
  programLabel: string;
}

const NoClassesMultiProgram = ({
  programOptions,
  classLabel,
  programLabel,
}: NoClassesMultiProgramProps): ReactElement => {
  const [picked, setPicked] = useState<string>(programOptions[0]?.value ?? "");
  return (
    <div className="flex flex-col gap-5 p-2">
      <PageHeader title={classLabel} />
      <p className="text-gray-600">
        {CLASSES_LIST_TEXT.emptyNoClassesTitle(classLabel)} —{" "}
        {CLASSES_LIST_TEXT.emptyNoClassesPickPrompt(programLabel, classLabel)}
      </p>
      <div className="flex max-w-md flex-col gap-3">
        <Select
          label={programLabel}
          options={programOptions}
          value={picked}
          onChange={(event) => setPicked(event.target.value)}
        />
        {picked && (
          <Link
            href={`/host/programs/${picked}/classes`}
            className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
          >
            {CLASSES_LIST_TEXT.emptyNoClassesDirectCta(
              programOptions.find((option) => option.value === picked)?.label ?? programLabel,
              classLabel,
            )}
          </Link>
        )}
      </div>
    </div>
  );
};
