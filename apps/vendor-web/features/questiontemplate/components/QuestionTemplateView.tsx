"use client";

import { useState, type ReactElement } from "react";
import type { QuestionTypeResponse } from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  AllSectionsIcon,
  Badge,
  BookOpenIcon,
  Button,
  Chip,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  EyeIcon,
  HeadphoneIcon,
  MicIcon,
  PencilIcon,
  TrashIcon,
  UploadIcon,
  cn,
  useToast,
  useRememberedState,
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
  QUESTION_TYPE_TEXT as RAW_QUESTION_TYPE_TEXT,
} from "../constants";
import { getQuestionTypeErrorMessage } from "../errorMessage";
import { sectionTone } from "@/lib/chipTones";
import { QuestionTypeEditorModal } from "./QuestionTypeEditorModal";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic, isPlatformAdmin } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_ALL_TAB } from "@/features/scoretemplate/constants";

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
  const [section, setSection] = useRememberedState<string>("section", SCORE_TEMPLATE_ALL_TAB);
  const allSectionsLabel = useAdminCopy("All sections");

  const sectionCounts: Record<string, number> = {
    [SCORE_TEMPLATE_ALL_TAB]: questionTypes.length,
    SPEAKING: questionTypes.filter((type) => type.section === "SPEAKING").length,
    WRITING: questionTypes.filter((type) => type.section === "WRITING").length,
    READING: questionTypes.filter((type) => type.section === "READING").length,
    LISTENING: questionTypes.filter((type) => type.section === "LISTENING").length,
  };

  const tabs = [
    {
      id: SCORE_TEMPLATE_ALL_TAB,
      label: allSectionsLabel,
      subLabel: undefined,
      icon: AllSectionsIcon,
      iconBg: "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
      count: sectionCounts[SCORE_TEMPLATE_ALL_TAB],
    },
    {
      id: "SPEAKING",
      label: sectionLabels.SPEAKING,
      subLabel: "Speaking",
      icon: MicIcon,
      iconBg: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
      count: sectionCounts.SPEAKING,
    },
    {
      id: "WRITING",
      label: sectionLabels.WRITING,
      subLabel: "Writing",
      icon: PencilIcon,
      iconBg: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
      count: sectionCounts.WRITING,
    },
    {
      id: "READING",
      label: sectionLabels.READING,
      subLabel: "Reading",
      icon: BookOpenIcon,
      iconBg: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
      count: sectionCounts.READING,
    },
    {
      id: "LISTENING",
      label: sectionLabels.LISTENING,
      subLabel: "Listening",
      icon: HeadphoneIcon,
      iconBg: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
      count: sectionCounts.LISTENING,
    },
  ];

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      setSection(tabs[nextIndex].id);
      document.getElementById(`section-tab-${tabs[nextIndex].id}`)?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setSection(tabs[prevIndex].id);
      document.getElementById(`section-tab-${tabs[prevIndex].id}`)?.focus();
    }
  };
  const visibleTypes =
    section === SCORE_TEMPLATE_ALL_TAB
      ? questionTypes
      : questionTypes.filter((type) => type.section === section);
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [editing, setEditing] = useState<QuestionTypeResponse | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<QuestionTypeResponse | null>(null);
  const beginCreate = (): void => {
    setEditing(null);
    setMode("create");
  };

  const beginView = (type: QuestionTypeResponse): void => {
    setEditing(type);
    setMode("view");
  };

  const canEditType = (type: QuestionTypeResponse): boolean =>
    type.lifecycleStatus === "DRAFT" || (type.lifecycleStatus === "ACTIVE" && canEditActiveType);

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
      { label: T.VIEW, icon: EyeIcon, onSelect: () => beginView(type) },
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
      {(deleteMutation.isError || submitMutation.isError || approveMutation.isError) && (
        <Alert tone="error">
          {errorMessage(
            deleteMutation.error ?? submitMutation.error ?? approveMutation.error,
            deleteMutation.isError ? T.DELETE_ERROR : T.WORKFLOW_ERROR,
          )}
        </Alert>
      )}
      {/* Horizontal Section Filter Tabs */}
      <div
        role="tablist"
        aria-label={T.TABLE_SECTION ?? "Phần thi"}
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-1.5 shadow-2xs"
      >
        {tabs.map((item, index) => {
          const isSelected = item.id === section;
          return (
            <button
              key={item.id}
              id={`section-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSection(item.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                isSelected
                  ? "border border-blue-200 bg-blue-50/90 text-blue-700 shadow-2xs dark:border-blue-800/80 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                  : "border border-transparent text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                    : item.iconBg,
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
              </span>
              <span className="flex items-baseline gap-1">
                <span>{item.label}</span>
                {item.subLabel && item.label !== item.subLabel && (
                  <span
                    className={cn(
                      "text-xs font-normal",
                      isSelected
                        ? "text-blue-600/75 dark:text-blue-400/80"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    ({item.subLabel})
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors",
                  isSelected
                    ? "bg-blue-200/70 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
                    : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] group-hover:bg-gray-200/80 dark:group-hover:bg-gray-700",
                )}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
          toolbarActions={
            <Button variant="primary" onClick={beginCreate}>
              + {T.CREATE}
            </Button>
          }
          columns={
            [
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
                cell: (type: QuestionTypeResponse) => (
                  <Chip tone={sectionTone(type.section)}>
                    {sectionLabels[type.section as keyof typeof sectionLabels] ?? type.section}
                  </Chip>
                ),
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
                filterAccessor: (type: QuestionTypeResponse) =>
                  type.active ? "ACTIVE" : "INACTIVE",
                cell: (type: QuestionTypeResponse) => {
                  const status = type.lifecycleStatus ?? (type.active ? "ACTIVE" : "INACTIVE");
                  return (
                    <Badge variant={type.active ? "success" : "neutral"}>
                      {lifecycleStatusLabels[status as keyof typeof lifecycleStatusLabels] ??
                        status}
                    </Badge>
                  );
                },
                className: "whitespace-nowrap",
              },
            ] satisfies DataTableColumn<QuestionTypeResponse>[]
          }
          rows={visibleTypes}
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
          key={`${mode === "create" ? "create" : "existing"}-${editing?.publicId ?? "new"}`}
          mode={mode}
          editing={editing}
          questionTypes={questionTypes}
          capabilities={capabilities}
          canEdit={editing !== null && canEditType(editing)}
          onRequestEdit={() => setMode("edit")}
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
