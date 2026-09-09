"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, DataTable, type DataTableColumn } from "@pte/ui";
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
import { useClasses, useClassStatusMutations, useCreateClass } from "../api";
import { CreateClassModal } from "./CreateClassModal";
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
}

const ClassRowActions = ({
  organizationPublicId,
  programPublicId,
  studentClass,
}: ClassRowActionsProps): ReactElement => {
  const mutations = useClassStatusMutations(organizationPublicId, programPublicId, studentClass.publicId);
  const pending =
    mutations.activate.isPending ||
    mutations.deactivate.isPending ||
    mutations.suspend.isPending ||
    mutations.archive.isPending;
  const rowError = errorMessage(
    mutations.activate.error ?? mutations.deactivate.error ?? mutations.suspend.error ?? mutations.archive.error,
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 text-sm">
        {studentClass.status !== "ACTIVE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => mutations.activate.mutate()}
            className="text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {CLASS_ROW_ACTIONS_TEXT.activate}
          </button>
        )}
        {studentClass.status === "ACTIVE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => mutations.suspend.mutate()}
            className="text-gray-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {CLASS_ROW_ACTIONS_TEXT.suspend}
          </button>
        )}
        {studentClass.status !== "INACTIVE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => mutations.deactivate.mutate()}
            className="text-gray-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {CLASS_ROW_ACTIONS_TEXT.deactivate}
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => mutations.archive.mutate()}
          className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {CLASS_ROW_ACTIONS_TEXT.archive}
        </button>
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
  const create = useCreateClass(organizationPublicId, programPublicId);
  const [createOpen, setCreateOpen] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const confirmCreate = (name: string): void => {
    create.mutate({ name }, { onSuccess: () => setCreateOpen(false) });
  };

  const createErrorMessage = errorMessage(create.error);

  const selectedClasses = (classes ?? []).filter((studentClass) => selectedKeys.has(studentClass.publicId));

  const exitMergeMode = (): void => {
    setMergeMode(false);
    setSelectedKeys(new Set());
  };

  const columns: DataTableColumn<ClassResponse>[] = [
    {
      key: "name",
      header: CLASS_TABLE_HEADERS.NAME,
      cell: (studentClass) => (
        <Link
          href={`/host/programs/${programPublicId}/classes/${studentClass.publicId}?organizationPublicId=${organizationPublicId}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {studentClass.name}
        </Link>
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
        <div className="flex items-center gap-2">
          {!mergeMode && (classes?.length ?? 0) >= 2 && (
            <button
              type="button"
              onClick={() => setMergeMode(true)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {MERGE_CLASSES_SELECTION_TEXT.startButton(classLabel)}
            </button>
          )}
          {!mergeMode && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {CLASSES_SECTION_TEXT.addButton(classLabel)}
            </button>
          )}
        </div>
      </div>

      {createErrorMessage && !createOpen && <Alert tone="error">{createErrorMessage}</Alert>}

      {mergeMode && (
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-800">{MERGE_CLASSES_SELECTION_TEXT.selectedCount(selectedKeys.size)}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={exitMergeMode} className="text-sm text-gray-600 hover:underline">
              {MERGE_CLASSES_SELECTION_TEXT.cancelSelection}
            </button>
            <button
              type="button"
              disabled={selectedKeys.size < 2}
              onClick={() => setMergeModalOpen(true)}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
        emptyTitle={CLASSES_SECTION_TEXT.emptyTitle(classLabel)}
        emptyDescription={CLASSES_SECTION_TEXT.emptyText(classLabel)}
        selectable={mergeMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectRowLabel={(studentClass) => studentClass.name}
      />

      <CreateClassModal
        key={createOpen ? "createClass-open" : "createClass-closed"}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        error={createErrorMessage}
        isSubmitting={create.isPending}
        classLabel={classLabel}
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
