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
  PageHeader,
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
  QUESTION_TYPE_TEXT,
} from "../constants";
import { getQuestionTypeErrorMessage } from "../errorMessage";
import { QuestionTypeEditorModal } from "./QuestionTypeEditorModal";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic, isPlatformAdmin } from "@/features/auth/permissions";

const errorMessage = (error: unknown, fallback: string): string =>
  getQuestionTypeErrorMessage(error, fallback);

const SECTION_FILTER_OPTIONS = [
  { label: QUESTION_TYPE_TEXT.ALL_SECTIONS, value: "" },
  ...QUESTION_TYPE_SECTIONS.map((section) => ({ label: section, value: section })),
];

const STATUS_FILTER_OPTIONS = [
  { label: QUESTION_TYPE_TEXT.ALL_STATUSES, value: "" },
  { label: QUESTION_TYPE_TEXT.ACTIVE, value: "ACTIVE" },
  { label: QUESTION_TYPE_TEXT.INACTIVE, value: "INACTIVE" },
];

const SCORED_FILTER_OPTIONS = [
  { label: QUESTION_TYPE_TEXT.ALL_SCORED, value: "" },
  { label: QUESTION_TYPE_TEXT.YES, value: "YES" },
  { label: QUESTION_TYPE_TEXT.NO, value: "NO" },
];

export const QuestionTypeView = (): ReactElement => {
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
      showToast(QUESTION_TYPE_TEXT.DELETE_SUCCESS);
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
              label: QUESTION_TYPE_TEXT.EDIT,
              icon: PencilIcon,
              onSelect: () => beginEdit(type),
            },
          ]
        : []),
      ...(isDraft
        ? [
            {
              label: QUESTION_TYPE_TEXT.SUBMIT_APPROVAL,
              icon: UploadIcon,
              disabled: submitMutation.isPending,
              onSelect: () =>
                submitMutation.mutate(type.publicId, {
                  onSuccess: () => showToast(QUESTION_TYPE_TEXT.SUBMIT_SUCCESS),
                }),
            },
          ]
        : isPendingApproval && canRetire
          ? [
              {
                label: QUESTION_TYPE_TEXT.APPROVE,
                icon: CheckCircleIcon,
                disabled: approveMutation.isPending,
                onSelect: () =>
                  approveMutation.mutate(type.publicId, {
                    onSuccess: () => showToast(QUESTION_TYPE_TEXT.APPROVE_SUCCESS),
                  }),
              },
            ]
          : []),
      ...(canRetire
        ? [
            {
              label: QUESTION_TYPE_TEXT.DELETE,
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
      <PageHeader
        title={QUESTION_TYPE_TEXT.TITLE}
        actions={
          <Button variant="primary" onClick={beginCreate}>
            + {QUESTION_TYPE_TEXT.CREATE}
          </Button>
        }
      />

      {(isError || capabilitiesError) && (
        <Alert tone="error">{QUESTION_TYPE_TEXT.LOAD_ERROR}</Alert>
      )}
      <Alert tone="info">{QUESTION_TYPE_TEXT.CATALOG_BOUNDARY_NOTICE}</Alert>
      {(deleteMutation.isError || submitMutation.isError || approveMutation.isError) && (
        <Alert tone="error">
          {errorMessage(
            deleteMutation.error ?? submitMutation.error ?? approveMutation.error,
            deleteMutation.isError ? QUESTION_TYPE_TEXT.DELETE_ERROR : QUESTION_TYPE_TEXT.WORKFLOW_ERROR,
          )}
        </Alert>
      )}
      <DataTable
        columns={[
          {
            key: "order",
            header: QUESTION_TYPE_TEXT.TABLE_ORDER,
            filterAccessor: (type: QuestionTypeResponse) => type.displayOrder,
            cell: (type: QuestionTypeResponse) => type.displayOrder,
            className: "whitespace-nowrap",
          },
          {
            key: "taskType",
            header: QUESTION_TYPE_TEXT.TABLE_QUESTION_TYPE,
            filterAccessor: (type: QuestionTypeResponse) =>
              [type.displayName, type.shortName, type.taskTypeKey, type.code].filter(Boolean).join(" "),
            cell: (type: QuestionTypeResponse) => (
              <div>
                <p className="font-medium text-gray-900">{type.displayName}</p>
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {type.taskTypeKey ?? type.code} {QUESTION_TYPE_TEXT.SEPARATOR} {type.shortName}
                </p>
              </div>
            ),
          },
          {
            key: "section",
            header: QUESTION_TYPE_TEXT.TABLE_SECTION,
            filterOptions: SECTION_FILTER_OPTIONS,
            filterAccessor: (type: QuestionTypeResponse) => type.section,
            cell: (type: QuestionTypeResponse) => type.section,
            className: "whitespace-nowrap",
          },
          {
            key: "requirements",
            header: QUESTION_TYPE_TEXT.TABLE_REQUIREMENTS,
            filterAccessor: (type: QuestionTypeResponse) =>
              QUESTION_TYPE_REQUIREMENT_LABELS.filter(([key]) => type[key])
                .map(([, label]) => label)
                .join(" "),
            cell: (type: QuestionTypeResponse) => (
              <div className="flex max-w-md flex-wrap gap-1">
                {QUESTION_TYPE_REQUIREMENT_LABELS.filter(([key]) => type[key]).map(
                  ([, label]) => (
                    <Badge key={label} variant="info">
                      {label}
                    </Badge>
                  ),
                )}
              </div>
            ),
          },
          {
            key: "scored",
            header: QUESTION_TYPE_TEXT.TABLE_SCORED,
            filterOptions: SCORED_FILTER_OPTIONS,
            filterAccessor: (type: QuestionTypeResponse) => (type.scored ? "YES" : "NO"),
            cell: (type: QuestionTypeResponse) =>
              type.scored ? QUESTION_TYPE_TEXT.YES : QUESTION_TYPE_TEXT.NO,
            className: "whitespace-nowrap",
          },
          {
            key: "status",
            header: QUESTION_TYPE_TEXT.TABLE_STATUS,
            filterOptions: STATUS_FILTER_OPTIONS,
            filterAccessor: (type: QuestionTypeResponse) => (type.active ? "ACTIVE" : "INACTIVE"),
            cell: (type: QuestionTypeResponse) => (
              <Badge variant={type.active ? "success" : "neutral"}>
                {type.lifecycleStatus ??
                  (type.active ? QUESTION_TYPE_TEXT.ACTIVE : QUESTION_TYPE_TEXT.INACTIVE)}
              </Badge>
            ),
            className: "whitespace-nowrap",
          },
        ] satisfies DataTableColumn<QuestionTypeResponse>[]}
        rows={questionTypes}
        getRowKey={(type) => type.publicId}
        isLoading={isLoading}
        searchPlaceholder={QUESTION_TYPE_TEXT.SEARCH_PLACEHOLDER}
        searchAriaLabel={QUESTION_TYPE_TEXT.SEARCH_ARIA_LABEL}
        rowActionsHeader={QUESTION_TYPE_TEXT.TABLE_ACTIONS}
        rowActions={(type) => (
          <ActionMenu label={QUESTION_TYPE_TEXT.ROW_ACTIONS} items={buildActions(type)} />
        )}
        emptyTitle={isLoading ? QUESTION_TYPE_TEXT.LOADING : QUESTION_TYPE_TEXT.EMPTY_LIST}
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
        title={QUESTION_TYPE_TEXT.DELETE}
        description={QUESTION_TYPE_TEXT.DELETE_CONFIRM}
        confirmLabel={QUESTION_TYPE_TEXT.DELETE}
        tone="danger"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => void confirmRemove()}
        onClose={() => setTypeToDelete(null)}
      />
    </div>
  );
};
