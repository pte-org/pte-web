"use client";

import { useState, type ReactElement } from "react";
import type { QuestionTypeResponse } from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  Badge,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  PencilIcon,
  TrashIcon,
  UploadIcon,
  useToast,
} from "@pte/ui";
import type { ActionMenuItem, DataTableColumn } from "@pte/ui";
import {
  useApproveTaskType,
  useRetireTaskType,
  useSubmitTaskTypeApproval,
  useTaskTypeCapabilities,
  useTaskTypes,
} from "../api";
import {
  QUESTION_TYPE_REQUIREMENT_LABELS,
  QUESTION_TYPE_SECTIONS,
  QUESTION_TYPE_TEXT as RAW_QUESTION_TYPE_TEXT,
} from "../constants";
import { getQuestionTypeErrorMessage } from "../errorMessage";
import { QuestionTypeEditorModal } from "./QuestionTypeEditorModal";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic, isPlatformAdmin } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";

const errorMessage = (error: unknown, fallback: string): string =>
  getQuestionTypeErrorMessage(error, fallback);

export const QuestionTypeView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_TYPE_TEXT);
  const requirementLabels = useAdminCopy(QUESTION_TYPE_REQUIREMENT_LABELS);
  const sectionLabels = useAdminCopy({
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  });
  const lifecycleStatusLabels = useAdminCopy({
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending approval",
    RETIRED: "Retired",
  });
  const sectionFilterOptions = useAdminCopy([
    { label: "All sections", value: "" },
    ...QUESTION_TYPE_SECTIONS.map((section) => ({
      label: (
        {
          SPEAKING: "Speaking",
          WRITING: "Writing",
          READING: "Reading",
          LISTENING: "Listening",
        } as const
      )[section],
      value: section,
    })),
  ]);
  const statusFilterOptions = useAdminCopy([
    { label: "All statuses", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ]);
  const scoredFilterOptions = useAdminCopy([
    { label: "All scoring modes", value: "" },
    { label: "Yes", value: "YES" },
    { label: "No", value: "NO" },
  ]);
  const { data: questionTypes = [], isLoading, isError } = useTaskTypes(false);
  const { data: currentUser } = useCurrentUser();
  const canRetire = canReviewAcademic(currentUser?.roles);
  const canEditActiveType = isPlatformAdmin(currentUser?.roles);
  const { data: capabilities = [], isError: capabilitiesError } = useTaskTypeCapabilities();
  const deleteMutation = useRetireTaskType();
  const submitMutation = useSubmitTaskTypeApproval();
  const approveMutation = useApproveTaskType();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<QuestionTypeResponse | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<QuestionTypeResponse | null>(null);
  const beginCreate = (): void => {
    setEditing(null);
    setMode("create");
  };

  const beginEdit = (type: QuestionTypeResponse): void => {
    setEditing(type);
    setMode("edit");
  };

  const closeEditor = (): void => {
    setMode(null);
    setEditing(null);
  };

  const confirmRemove = async (): Promise<void> => {
    if (!typeToDelete) return;
    try {
      await deleteMutation.mutateAsync({ publicId: typeToDelete.publicId });
      showToast(T.DELETE_SUCCESS);
      setTypeToDelete(null);
    } catch {
      // The mutation error is rendered below with the API's message; keep the dialog open.
    }
  };

  const buildActions = (type: QuestionTypeResponse): ActionMenuItem[] => {
    const isDraft = type.lifecycleStatus === "DRAFT";
    const isPendingApproval = type.lifecycleStatus === "PENDING_APPROVAL";

    return [
      ...(isDraft || (type.lifecycleStatus === "ACTIVE" && canEditActiveType)
        ? [
            {
              label: T.EDIT,
              icon: PencilIcon,
              onSelect: () => beginEdit(type),
            },
          ]
        : []),
      ...(isDraft
        ? [
            {
              label: T.SUBMIT_APPROVAL,
              icon: UploadIcon,
              disabled: submitMutation.isPending,
              onSelect: () =>
                submitMutation.mutate(type.publicId, {
                  onSuccess: () => showToast(T.SUBMIT_SUCCESS),
                }),
            },
          ]
        : isPendingApproval && canRetire
          ? [
              {
                label: T.APPROVE,
                icon: CheckCircleIcon,
                disabled: approveMutation.isPending,
                onSelect: () =>
                  approveMutation.mutate(type.publicId, {
                    onSuccess: () => showToast(T.APPROVE_SUCCESS),
                  }),
              },
            ]
          : []),
      ...(canRetire
        ? [
            {
              label: T.DELETE,
              icon: TrashIcon,
              danger: true,
              disabled:
                deleteMutation.isPending && deleteMutation.variables?.publicId === type.publicId,
              onSelect: () => setTypeToDelete(type),
            },
          ]
        : []),
    ];
  };

  return (
    <div className="space-y-6">
      {(isError || capabilitiesError) && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
      <Alert tone="info">{T.CATALOG_BOUNDARY_NOTICE}</Alert>
      {(deleteMutation.isError || submitMutation.isError || approveMutation.isError) && (
        <Alert tone="error">
          {errorMessage(
            deleteMutation.error ?? submitMutation.error ?? approveMutation.error,
            deleteMutation.isError ? T.DELETE_ERROR : T.WORKFLOW_ERROR,
          )}
        </Alert>
      )}
      <DataTable
        toolbarActions={
          <Button variant="primary" onClick={beginCreate}>
            + {T.CREATE}
          </Button>
        }
        columns={
          [
            {
              key: "order",
              header: T.TABLE_ORDER,
              filterAccessor: (type: QuestionTypeResponse) => type.displayOrder,
              cell: (type: QuestionTypeResponse) => type.displayOrder,
              className: "whitespace-nowrap",
            },
            {
              key: "taskType",
              header: T.TABLE_QUESTION_TYPE,
              filterAccessor: (type: QuestionTypeResponse) =>
                [type.displayName, type.shortName, type.taskTypeKey, type.code]
                  .filter(Boolean)
                  .join(" "),
              cell: (type: QuestionTypeResponse) => (
                <div>
                  <p className="font-medium text-gray-900">{type.displayName}</p>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {type.taskTypeKey ?? type.code} {T.SEPARATOR} {type.shortName}
                  </p>
                </div>
              ),
            },
            {
              key: "section",
              header: T.TABLE_SECTION,
              filterOptions: sectionFilterOptions,
              filterAccessor: (type: QuestionTypeResponse) => type.section,
              cell: (type: QuestionTypeResponse) =>
                sectionLabels[type.section as keyof typeof sectionLabels] ?? type.section,
              className: "whitespace-nowrap",
            },
            {
              key: "requirements",
              header: T.TABLE_REQUIREMENTS,
              filterAccessor: (type: QuestionTypeResponse) =>
                requirementLabels
                  .filter(([key]) => type[key])
                  .map(([, label]) => label)
                  .join(" "),
              cell: (type: QuestionTypeResponse) => (
                <div className="flex max-w-md flex-wrap gap-1">
                  {requirementLabels
                    .filter(([key]) => type[key])
                    .map(([, label]) => (
                      <Badge key={label} variant="info">
                        {label}
                      </Badge>
                    ))}
                </div>
              ),
            },
            {
              key: "scored",
              header: T.TABLE_SCORED,
              filterOptions: scoredFilterOptions,
              filterAccessor: (type: QuestionTypeResponse) => (type.scored ? "YES" : "NO"),
              cell: (type: QuestionTypeResponse) => (type.scored ? T.YES : T.NO),
              className: "whitespace-nowrap",
            },
            {
              key: "status",
              header: T.TABLE_STATUS,
              filterOptions: statusFilterOptions,
              filterAccessor: (type: QuestionTypeResponse) => (type.active ? "ACTIVE" : "INACTIVE"),
              cell: (type: QuestionTypeResponse) => {
                const status = type.lifecycleStatus ?? (type.active ? "ACTIVE" : "INACTIVE");
                return (
                  <Badge variant={type.active ? "success" : "neutral"}>
                    {lifecycleStatusLabels[status as keyof typeof lifecycleStatusLabels] ?? status}
                  </Badge>
                );
              },
              className: "whitespace-nowrap",
            },
          ] satisfies DataTableColumn<QuestionTypeResponse>[]
        }
        rows={questionTypes}
        getRowKey={(type) => type.publicId}
        isLoading={isLoading}
        searchPlaceholder={T.SEARCH_PLACEHOLDER}
        searchAriaLabel={T.SEARCH_ARIA_LABEL}
        rowActionsHeader={T.TABLE_ACTIONS}
        rowActions={(type) => <ActionMenu label={T.ROW_ACTIONS} items={buildActions(type)} />}
        emptyTitle={isLoading ? T.LOADING : T.EMPTY_LIST}
      />

      {mode && (
        <QuestionTypeEditorModal
          key={`${mode}-${editing?.publicId ?? "new"}`}
          mode={mode}
          editing={editing}
          questionTypes={questionTypes}
          capabilities={capabilities}
          onClose={closeEditor}
          onSuccess={(successMessage) => {
            showToast(successMessage);
            closeEditor();
          }}
        />
      )}

      <ConfirmDialog
        open={typeToDelete !== null}
        title={T.DELETE}
        description={T.DELETE_CONFIRM}
        confirmLabel={T.DELETE}
        tone="danger"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => void confirmRemove()}
        onClose={() => setTypeToDelete(null)}
      />
    </div>
  );
};
