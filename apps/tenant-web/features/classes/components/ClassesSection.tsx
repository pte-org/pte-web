"use client";

import { useState, type ReactElement } from "react";
import { Alert, Badge, DataTable, type DataTableColumn } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  CLASS_STATUS_LABELS,
  CLASS_STATUS_FILTER_OPTIONS,
  CLASS_STATUS_VARIANT,
  CLASS_TABLE_HEADERS,
  CLASSES_SECTION_TEXT,
  MERGE_CLASSES_SELECTION_TEXT,
} from "../constants";
import { useClasses, useUpdateClass } from "../api";
import { ClassRowActions } from "./ClassRowActions";
import { EditClassModal } from "./EditClassModal";
import { MergeClassesModal } from "./MergeClassesModal";

interface ClassesSectionProps {
  organizationPublicId: string;
  programPublicId: string;
  classLabel: string;
  /**
   * Per-class student counts keyed by class publicId, read from the Program dashboard
   * query that is already cached on this screen. Optional so the section still renders
   * (with 0) wherever the dashboard is not mounted.
   */
  studentCountByClassPublicId?: ReadonlyMap<string, number>;
}

export const ClassesSection = ({
  organizationPublicId,
  programPublicId,
  classLabel,
  studentCountByClassPublicId,
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
      filterOptions: CLASS_STATUS_FILTER_OPTIONS,
      filterAccessor: (studentClass) => studentClass.status,
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
          studentCount={studentCountByClassPublicId?.get(studentClass.publicId) ?? 0}
          classLabel={classLabel}
          studentClass={studentClass}
          onEdit={() => setEditingClass(studentClass)}
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
    </div>
  );
};
