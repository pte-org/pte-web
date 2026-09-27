"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Badge,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  PencilIcon,
  ShieldIcon,
  TrashIcon,
  useToast,
  type ActionMenuItem,
  type DataTableColumn,
} from "@pte/ui";
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
import { useClasses, useClassStatusMutations, useCreateClass, useUpdateClass } from "../api";
import { CreateClassModal } from "./CreateClassModal";
import { EditClassModal } from "./EditClassModal";
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
  classLabel: string;
  onEdit: () => void;
}

type PendingConfirmAction = "SUSPEND" | "DEACTIVATE" | "ARCHIVE" | null;

const ClassRowActions = ({
  organizationPublicId,
  programPublicId,
  studentClass,
  classLabel,
  onEdit,
}: ClassRowActionsProps): ReactElement => {
  const mutations = useClassStatusMutations(
    organizationPublicId,
    programPublicId,
    studentClass.publicId,
  );
  const { showToast } = useToast();
  const [confirmAction, setConfirmAction] = useState<PendingConfirmAction>(null);
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

  const items: ActionMenuItem[] = [
    { label: CLASS_ROW_ACTIONS_TEXT.edit, icon: PencilIcon, onSelect: onEdit, disabled: pending },
    {
      label: CLASS_ROW_ACTIONS_TEXT.activate,
      icon: CheckCircleIcon,
      onSelect: () =>
        mutations.activate.mutate(undefined, {
          onSuccess: () => showToast(CLASS_ROW_ACTIONS_TEXT.activateSuccess(classLabel)),
          onError: () =>
            showToast(CLASS_ROW_ACTIONS_TEXT.statusUpdateError(classLabel), { tone: "error" }),
        }),
      disabled: pending,
      hidden: studentClass.status === "ACTIVE",
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.suspend,
      icon: BanIcon,
      onSelect: () => setConfirmAction("SUSPEND"),
      disabled: pending,
      hidden: studentClass.status !== "ACTIVE",
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.deactivate,
      icon: ShieldIcon,
      onSelect: () => setConfirmAction("DEACTIVATE"),
      disabled: pending,
      hidden: studentClass.status === "INACTIVE",
    },
    { separator: true },
    {
      label: CLASS_ROW_ACTIONS_TEXT.archive,
      icon: TrashIcon,
      onSelect: () => setConfirmAction("ARCHIVE"),
      disabled: pending,
      danger: true,
    },
  ];

  const notify = (successMessage: string) => ({
    onSuccess: () => showToast(successMessage),
    onError: () =>
      showToast(CLASS_ROW_ACTIONS_TEXT.statusUpdateError(classLabel), { tone: "error" }),
  });

  const confirmDialogProps = {
    SUSPEND: {
      title: CLASS_ROW_ACTIONS_TEXT.suspendConfirmTitle(classLabel),
      description: CLASS_ROW_ACTIONS_TEXT.suspendConfirmDescription(classLabel),
      confirmLabel: CLASS_ROW_ACTIONS_TEXT.suspend,
      tone: "primary" as const,
      onConfirm: () =>
        mutations.suspend.mutate(
          undefined,
          notify(CLASS_ROW_ACTIONS_TEXT.suspendSuccess(classLabel)),
        ),
    },
    DEACTIVATE: {
      title: CLASS_ROW_ACTIONS_TEXT.deactivateConfirmTitle(classLabel),
      description: CLASS_ROW_ACTIONS_TEXT.deactivateConfirmDescription(classLabel),
      confirmLabel: CLASS_ROW_ACTIONS_TEXT.deactivate,
      tone: "primary" as const,
      onConfirm: () =>
        mutations.deactivate.mutate(
          undefined,
          notify(CLASS_ROW_ACTIONS_TEXT.deactivateSuccess(classLabel)),
        ),
    },
    ARCHIVE: {
      title: CLASS_ROW_ACTIONS_TEXT.archiveConfirmTitle(classLabel),
      description: CLASS_ROW_ACTIONS_TEXT.archiveConfirmDescription(classLabel),
      confirmLabel: CLASS_ROW_ACTIONS_TEXT.archive,
      tone: "danger" as const,
      onConfirm: () =>
        mutations.archive.mutate(
          undefined,
          notify(CLASS_ROW_ACTIONS_TEXT.archiveSuccess(classLabel)),
        ),
    },
  } as const;

  const activeConfirm = confirmAction ? confirmDialogProps[confirmAction] : null;

  return (
    <div className="flex flex-col gap-1">
      <ActionMenu items={items} />
      {rowError && <p className="text-xs text-red-600">{rowError}</p>}
      <ConfirmDialog
        open={activeConfirm !== null}
        title={activeConfirm?.title ?? ""}
        description={activeConfirm?.description ?? ""}
        confirmLabel={activeConfirm?.confirmLabel ?? ""}
        cancelLabel={CLASS_ROW_ACTIONS_TEXT.cancel}
        tone={activeConfirm?.tone}
        isConfirming={pending}
        onConfirm={() => {
          activeConfirm?.onConfirm();
          setConfirmAction(null);
        }}
        onClose={() => setConfirmAction(null)}
      />
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
  const { showToast } = useToast();
  const [editingClass, setEditingClass] = useState<ClassResponse | null>(null);
  const update = useUpdateClass(
    organizationPublicId,
    programPublicId,
    editingClass?.publicId ?? "",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const confirmCreate = (name: string): void => {
    create.mutate(
      { name },
      {
        onSuccess: () => {
          setCreateOpen(false);
          showToast(CLASSES_SECTION_TEXT.createSuccess(classLabel));
        },
        onError: () =>
          showToast(CLASSES_SECTION_TEXT.createError(classLabel), { tone: "error" }),
      },
    );
  };

  const createErrorMessage = errorMessage(create.error);
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
          classLabel={classLabel}
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
              onSuccess: () => {
                setEditingClass(null);
                showToast(CLASSES_SECTION_TEXT.updateSuccess(classLabel));
              },
              onError: () =>
                showToast(CLASSES_SECTION_TEXT.updateError(classLabel), { tone: "error" }),
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
