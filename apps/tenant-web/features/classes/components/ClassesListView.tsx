"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  FolderPlusIcon,
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

interface ProgramOption {
  value: string;
  label: string;
}

interface ClassesListViewProps {
  organizationOptions: ProgramOption[];
  selectedOrganizationPublicId: string;
  onOrganizationChange: (organizationPublicId: string) => void;
  /** Programs the tenant already owns (loaded from /programs endpoint, not derived from classes). */
  allPrograms: ProgramOption[];
  /** Open the create-class modal pre-filled with the picked program. */
  onRequestCreateClass: (programPublicId: string) => void;
  /** Open the import/assign modal pre-bound to a specific class. */
  onRequestAssignStudents: (input: {
    organizationPublicId: string;
    programPublicId: string;
    classPublicId: string;
  }) => void;
}

interface ClassRowActionsProps {
  option: TenantClassOption;
  onAssignStudents: (input: {
    organizationPublicId: string;
    programPublicId: string;
    classPublicId: string;
  }) => void;
}

const ClassRowActions = ({ option, onAssignStudents }: ClassRowActionsProps): ReactElement => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href={`/host/programs/${option.programPublicId}/classes/${option.classPublicId}?organizationPublicId=${option.organizationPublicId}`}
        className="font-medium text-blue-700 hover:underline"
      >
        {CLASS_ROW_ACTIONS_TEXT.edit}
      </Link>
      <button
        type="button"
        onClick={() =>
          onAssignStudents({
            organizationPublicId: option.organizationPublicId,
            programPublicId: option.programPublicId,
            classPublicId: option.classPublicId,
          })
        }
        className="text-blue-700 hover:underline"
      >
        {CLASS_ROW_ACTIONS_TEXT.assignStudents}
      </button>
    </div>
  );
};

export const ClassesListView = ({
  organizationOptions,
  selectedOrganizationPublicId,
  onOrganizationChange,
  allPrograms,
  onRequestCreateClass,
  onRequestAssignStudents,
}: ClassesListViewProps): ReactElement => {
  const labels = useOrgLabels();
  const { data: classes, isLoading, isError, error } = useAllTenantClasses();
  const [programFilter, setProgramFilter] = useState<string>(ALL_FILTER);

  // Programs that already contain at least one class — used by the in-row
  // class filter. Distinct from `allPrograms` which is the full owned list,
  // including programs that have no class yet.
  const programsWithClasses = useMemo(() => {
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

  // "Tenant owns no programs" comes from `allPrograms` (the Programs API),
  // not from the classes fan-out: a tenant with zero classes but several
  // programs is *not* in this branch.
  const tenantHasNoPrograms = !isLoading && allPrograms.length === 0;

  if (tenantHasNoPrograms) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-6">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-white px-8 py-10 text-center shadow-card">
          <FolderPlusIcon className="h-12 w-12 text-action" />
          <h2 className="text-xl font-semibold text-slate-900">
            {CLASSES_LIST_TEXT.emptyNoProgramsTitle(labels.program)}
          </h2>
          <p className="text-sm text-slate-500">
            {CLASSES_LIST_TEXT.emptyNoProgramsDescription(labels.program, labels.class)}
          </p>
          <Link href="/host/programs" className="mt-2">
            <Button variant="primary" size="lg">
              {CLASSES_LIST_TEXT.emptyNoProgramsCta(labels.program)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // "Tenant owns programs but none of them have any class" — give a per-row
  // Add Class CTA so the host doesn't have to navigate into each Program.
  if (!isLoading && (classes ?? []).length === 0 && allPrograms.length >= 1) {
    return (
      <PickProgramToAddClass
        programs={allPrograms}
        classLabel={labels.class}
        programLabel={labels.program}
        onRequestCreateClass={onRequestCreateClass}
      />
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
      cell: (option) => (
        <ClassRowActions option={option} onAssignStudents={onRequestAssignStudents} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-gray-600">
        {organizationOptions.length > 1
          ? CLASSES_LIST_TEXT.subtitleScoped(labels.class, labels.program)
          : CLASSES_LIST_TEXT.subtitle(labels.class, labels.program)}
      </p>

      {organizationOptions.length > 1 && (
        <Select
          label={CLASSES_LIST_TEXT.createClassPickerLabel(labels.program)}
          options={organizationOptions}
          value={selectedOrganizationPublicId}
          onChange={(event) => onOrganizationChange(event.target.value)}
        />
      )}

      {programsWithClasses.length >= 2 && (
        <Select
          label={CLASSES_LIST_TEXT.programFilterLabel(labels.program)}
          options={[
            { value: ALL_FILTER, label: CLASSES_LIST_TEXT.programFilterAll(labels.program) },
            ...programsWithClasses,
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

interface PickProgramToAddClassProps {
  programs: ProgramOption[];
  classLabel: string;
  programLabel: string;
  onRequestCreateClass: (programPublicId: string) => void;
}

const PickProgramToAddClass = ({
  programs,
  classLabel,
  programLabel,
  onRequestCreateClass,
}: PickProgramToAddClassProps): ReactElement => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-slate-900">
        {CLASSES_LIST_TEXT.pickProgramHeading(classLabel)}
      </h3>
      <p className="text-sm text-slate-500">
        {CLASSES_LIST_TEXT.pickProgramSubheading(programLabel)}
      </p>
    </div>

    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {programs.map((program) => (
        <li
          key={program.value}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <span className="text-sm font-medium text-slate-900">{program.label}</span>
          <button
            type="button"
            onClick={() => onRequestCreateClass(program.value)}
            className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover"
          >
            {CLASSES_LIST_TEXT.pickProgramRowCta}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
