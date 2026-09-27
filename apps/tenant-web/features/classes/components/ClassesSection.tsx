"use client";

import { useState, type ReactElement } from "react";
import { Alert, Badge, DataTable, Dropdown, type DataTableColumn, type DropdownItem } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  CLASS_ROW_ACTIONS_TEXT,
  CLASS_STATUS_LABELS,
  CLASS_STATUS_VARIANT,
  CLASS_TABLE_HEADERS,
  CLASSES_SECTION_TEXT,
  MERGE_CLASSES_SELECTION_TEXT,
} from "../constants";
import { useClasses, useClassStatusMutations, useUpdateClass } from "../api";
import { EditClassModal } from "./EditClassModal";
import { ImportOrAssignModal } from "./ImportOrAssignModal";
import { MergeClassesModal } from "./MergeClassesModal";

interface ClassesSectionProps {
  organizationPublicId: string;
  programPublicId: string;
  classLabel: string;
}

interface ClassRowActionsProps {
  organizationPublicId: string;
  programPublicId: string;
  studentClass: ClassResponse;
  onEdit: () => void;
  onAssignStudents: () => void;
}

const ClassRowActions = ({
  organizationPublicId,
  programPublicId,
  studentClass,
  onEdit,
  onAssignStudents,
}: ClassRowActionsProps): ReactElement => {
  const mutations = useClassStatusMutations(
    organizationPublicId,
    programPublicId,
    studentClass.publicId,
  );
  const pending =
    mutations.activate.isPending ||
    mutations.deactivate.isPending ||
    mutations.suspend.isPending ||
    mutations.archive.isPending;
  const rowError = errorMessage(
    mutations.activate.error ??
      mutations.deactivate.error ??
      mutations.suspend.error ??
      mutations.archive.error,
  );

  const isActive = studentClass.status === "ACTIVE";
  const assignDisabled = pending || !isActive;
  const kebabItems: DropdownItem[] = [
    {
      label: CLASS_ROW_ACTIONS_TEXT.activate,
      onSelect: () => mutations.activate.mutate(),
      hidden: isActive,
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.suspend,
      onSelect: () => mutations.suspend.mutate(),
      hidden: !isActive,
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.deactivate,
      onSelect: () => mutations.deactivate.mutate(),
      hidden: studentClass.status === "INACTIVE",
    },
    { separator: true, key: "danger-divider" },
    {
      label: CLASS_ROW_ACTIONS_TEXT.archive,
      onSelect: () => mutations.archive.mutate(),
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={pending}
          aria-label={`${CLASS_ROW_ACTIONS_TEXT.edit} ${studentClass.name}`}
          className="rounded-full border border-action bg-transparent px-4 py-1.5 text-sm font-semibold text-action transition-colors hover:bg-action/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {CLASS_ROW_ACTIONS_TEXT.edit}
        </button>
        <button
          type="button"
          disabled={assignDisabled}
          onClick={onAssignStudents}
          title={
            isActive
              ? undefined
              : CLASS_ROW_ACTIONS_TEXT.assignStudentsDisabledTitle
          }
          aria-label={`${CLASS_ROW_ACTIONS_TEXT.assignStudents} ${studentClass.name}`}
          aria-describedby={isActive ? undefined : `assign-help-${studentClass.publicId}`}
          className="rounded-full border border-slate-300 bg-transparent px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {CLASS_ROW_ACTIONS_TEXT.assignStudents}
        </button>
        <span id={`assign-help-${studentClass.publicId}`} className="sr-only">
          {CLASS_ROW_ACTIONS_TEXT.assignStudentsDisabledTitle}
        </span>
        <Dropdown
          items={kebabItems}
          label={CLASS_ROW_ACTIONS_TEXT.moreOptions(studentClass.name)}
          triggerClassName="h-8 w-8 rounded-md text-slate-500 hover:bg-slate-100"
          align="right"
        />
      </div>
      {rowError && <p className="text-xs text-red-600">{rowError}</p>}
    </div>
  );
};

export const ClassesSection = ({
  organizationPublicId,
  programPublicId,
  classLabel,
}: ClassesSectionProps): ReactElement => {
  const { data: classes, isLoading } = useClasses(organizationPublicId, programPublicId);
  const [editingClass, setEditingClass] = useState<ClassResponse | null>(null);
  const update = useUpdateClass(
    organizationPublicId,
    programPublicId,
    editingClass?.publicId ?? "",
  );
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [importClassId, setImportClassId] = useState<string | null>(null);

  const updateErrorMessage = errorMessage(update.error);

  const selectedClasses = (classes ?? []).filter((studentClass) =>
    selectedKeys.has(studentClass.publicId),
  );

  const exitMergeMode = (): void => {
    setMergeMode(false);
    setSelectedKeys(new Set());
  };

  const columns: DataTableColumn<ClassResponse>[] = [
    {
      key: "name",
      header: CLASS_TABLE_HEADERS.NAME,
      cell: (studentClass) => (
        <span className="font-medium text-slate-900">{studentClass.name}</span>
      ),
    },
    {
      key: "status",
      header: CLASS_TABLE_HEADERS.STATUS,
      cell: (studentClass) => (
        <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>
          {CLASS_STATUS_LABELS[studentClass.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: CLASS_TABLE_HEADERS.ACTIONS,
      cell: (studentClass) => (
        <ClassRowActions
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          studentClass={studentClass}
          onEdit={() => setEditingClass(studentClass)}
          onAssignStudents={() => setImportClassId(studentClass.publicId)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {CLASSES_SECTION_TEXT.countLabel(classes?.length ?? 0, classLabel)}
        </p>
        {!mergeMode && (classes?.length ?? 0) >= 2 && (
          <button
            type="button"
            onClick={() => setMergeMode(true)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {MERGE_CLASSES_SELECTION_TEXT.startButton(classLabel)}
          </button>
        )}
      </div>

      {updateErrorMessage && !editingClass && <Alert tone="error">{updateErrorMessage}</Alert>}

      {mergeMode && (
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-800">
            {MERGE_CLASSES_SELECTION_TEXT.selectedCount(selectedKeys.size)}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exitMergeMode}
              className="text-sm text-gray-600 hover:underline"
            >
              {MERGE_CLASSES_SELECTION_TEXT.cancelSelection}
            </button>
            <button
              type="button"
              disabled={selectedKeys.size < 2}
              onClick={() => setMergeModalOpen(true)}
              className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {MERGE_CLASSES_SELECTION_TEXT.confirmButton}
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={classes ?? []}
        getRowKey={(studentClass) => studentClass.publicId}
        isLoading={isLoading}
        emptyTitle={CLASSES_SECTION_TEXT.emptyInlineTitle(classLabel)}
        emptyDescription={CLASSES_SECTION_TEXT.emptyInlineDescription(classLabel)}
        selectable={mergeMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectRowLabel={(studentClass) => studentClass.name}
      />

      <EditClassModal
        key={editingClass?.publicId ?? "editClass-closed"}
        open={editingClass !== null}
        onClose={() => {
          update.reset();
          setEditingClass(null);
        }}
        onSubmit={(name) =>
          update.mutate(
            { name },
            {
              onSuccess: () => setEditingClass(null),
            },
          )
        }
        error={updateErrorMessage}
        isSubmitting={update.isPending}
        classLabel={classLabel}
        initialName={editingClass?.name ?? ""}
      />

      <MergeClassesModal
        key={mergeModalOpen ? "mergeClasses-open" : "mergeClasses-closed"}
        open={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        selectedClasses={selectedClasses}
        classLabel={classLabel}
        onMerged={() => {
          setMergeModalOpen(false);
          exitMergeMode();
        }}
      />

      <ImportOrAssignModal
        key={importClassId ?? "importOrAssign-closed"}
        open={importClassId !== null}
        onClose={() => setImportClassId(null)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={importClassId ?? ""}
      />
    </div>
  );
};
