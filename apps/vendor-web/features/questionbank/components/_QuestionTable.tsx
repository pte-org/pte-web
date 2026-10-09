import { useState, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Badge,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  DocumentIcon,
  PencilIcon,
  TrashIcon,
  UploadIcon,
  useToast,
  type ActionMenuItem,
} from "@pte/ui";
import {
  useApproveQuestion,
  useArchiveQuestion,
  useDeleteQuestion,
  useRejectQuestion,
  useSubmitQuestionApproval,
  useUnarchiveQuestion,
} from "../api";
import {
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
  QUESTION_SKILL_LABELS as RAW_QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS as RAW_QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS as RAW_QUESTION_TABLE_HEADERS,
} from "../constants";
import type { Question } from "../types";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { RejectQuestionModal } from "./_RejectQuestionModal";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";

interface QuestionTableProps {
  questions: Question[];
  isLoading?: boolean;
  toolbarActions?: ReactNode;
}

import { useAdminCopy } from "@/features/i18n/adminCopy";

export const QuestionTable = ({
  questions,
  isLoading = false,
  toolbarActions,
}: QuestionTableProps): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const H = useAdminCopy(RAW_QUESTION_TABLE_HEADERS);
  const skillLabels = useAdminCopy(RAW_QUESTION_SKILL_LABELS);
  const statusLabels = useAdminCopy(RAW_QUESTION_STATUS_LABELS);
  const skillFilterOptions = useAdminCopy([
    { value: "", label: "All skills" },
    { value: "listening", label: "Listening" },
    { value: "reading", label: "Reading" },
    { value: "writing", label: "Writing" },
    { value: "speaking", label: "Speaking" },
  ]);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending_approval", label: "Pending approval" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { showToast } = useToast();
  const submitMutation = useSubmitQuestionApproval();
  const approveMutation = useApproveQuestion();
  const rejectMutation = useRejectQuestion();
  const archiveMutation = useArchiveQuestion();
  const deleteMutation = useDeleteQuestion();
  const unarchiveMutation = useUnarchiveQuestion();
  const canReview = canReviewAcademic(currentUser?.roles);
  const [questionToArchive, setQuestionToArchive] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const isBusy =
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    archiveMutation.isPending ||
    unarchiveMutation.isPending ||
    deleteMutation.isPending;
  const [questionToReject, setQuestionToReject] = useState<Question | null>(null);
  const hasMutationError =
    submitMutation.isError ||
    approveMutation.isError ||
    rejectMutation.isError ||
    archiveMutation.isError ||
    deleteMutation.isError ||
    unarchiveMutation.isError;

  const buildActions = (question: Question): ActionMenuItem[] => {
    const actions: ActionMenuItem[] = [
      {
        label: T.ROW_VIEW_DETAILS,
        icon: DocumentIcon,
        onSelect: () => router.push(`/admin/questions/${question.id}`),
      },
    ];
    if (question.status === "draft") {
      actions.push({
        label: T.ROW_SUBMIT,
        icon: UploadIcon,
        onSelect: () =>
          submitMutation.mutate(question.id, {
            onSuccess: () => showToast(T.SUBMIT_SUCCESS),
          }),
      });
    }
    if (question.status === "pending_approval" && canReview) {
      actions.push({
        label: T.ROW_APPROVE,
        icon: CheckCircleIcon,
        onSelect: () =>
          approveMutation.mutate(question.id, {
            onSuccess: () => showToast(T.APPROVE_SUCCESS),
          }),
      });
      actions.push({
        label: T.ROW_REJECT,
        icon: BanIcon,
        onSelect: () => setQuestionToReject(question),
      });
    }
    if (question.canArchive === true) {
      actions.push({
        label: T.ROW_ARCHIVE,
        icon: BanIcon,
        onSelect: () => {
          archiveMutation.reset();
          setQuestionToArchive(question);
        },
      });
    }
    if (question.status === "draft" && question.canDeleteDraft === true) {
      actions.push({
        label: T.ROW_DELETE_DRAFT,
        icon: TrashIcon,
        danger: true,
        onSelect: () => {
          deleteMutation.reset();
          setQuestionToDelete(question);
        },
      });
    } else if (question.status === "draft" && question.canArchive !== true) {
      actions.push({
        label: T.DELETE_BLOCKED,
        disabled: true,
        onSelect: () => undefined,
      });
    }
    if (question.status === "archived" && canReview) {
      actions.push({
        label: T.ROW_UNARCHIVE,
        icon: CheckCircleIcon,
        onSelect: () =>
          unarchiveMutation.mutate(question.id, {
            onSuccess: () => showToast(T.UNARCHIVE_SUCCESS),
          }),
      });
    }
    if (question.status === "draft" || question.status === "published") {
      actions.push({
        label: T.ROW_EDIT,
        icon: PencilIcon,
        onSelect: () => router.push(`/admin/questions/${question.id}/edit`),
      });
    }
    return actions.map((action) =>
      "separator" in action ? action : { ...action, disabled: isBusy || action.disabled },
    );
  };

  const confirmArchive = (): void => {
    if (!questionToArchive || isBusy) return;
    archiveMutation.mutate(questionToArchive.id, {
      onSuccess: () => {
        showToast(T.ARCHIVE_SUCCESS);
        setQuestionToArchive(null);
      },
    });
  };

  const confirmDelete = (): void => {
    if (!questionToDelete || isBusy) return;
    deleteMutation.mutate(questionToDelete.id, {
      onSuccess: () => {
        showToast(T.DELETE_SUCCESS);
        setQuestionToDelete(null);
      },
    });
  };

  const confirmReject = (reason: string): void => {
    if (!questionToReject) return;
    rejectMutation.mutate(
      { id: questionToReject.id, reason },
      {
        onSuccess: () => {
          showToast(T.REJECT_SUCCESS);
          setQuestionToReject(null);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {hasMutationError && <Alert tone="error">{T.STATUS_UPDATE_ERROR}</Alert>}
      <DataTable
        toolbarActions={toolbarActions}
        columns={[
          {
            key: "skill",
            label: H.SKILL,
            header: H.SKILL,
            filterOptions: skillFilterOptions,
            filterAccessor: (question) => question.skill,
            cell: (question) => skillLabels[question.skill],
          },
          {
            key: "content",
            label: H.CONTENT,
            header: H.CONTENT,
            filterAccessor: (question) => question.content,
            cell: (question) => <span className="line-clamp-1 max-w-xl">{question.content}</span>,
          },
          {
            key: "status",
            label: H.STATUS,
            header: H.STATUS,
            filterOptions: statusFilterOptions,
            filterAccessor: (question) => question.status,
            cell: (question) => (
              <Badge variant={QUESTION_STATUS_VARIANT[question.status]}>
                {statusLabels[question.status]}
              </Badge>
            ),
          },
        ]}
        rows={questions}
        getRowKey={(question) => question.id}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        emptyDescription={T.EMPTY_DESCRIPTION_FILTERED}
        searchPlaceholder={T.SEARCH_PLACEHOLDER}
        searchAriaLabel={T.SEARCH_PLACEHOLDER}
        clientSidePagination
        initialPageSize={10}
        tableClassName="min-w-[900px]"
        rowActionsHeader={H.ACTIONS}
        rowActions={(question) => <ActionMenu items={buildActions(question)} />}
      />
      <ConfirmDialog
        open={questionToArchive !== null}
        title={T.ARCHIVE_CONFIRM_TITLE}
        description={
          <>
            <p>{questionToArchive?.content}</p>
            <p>{T.ARCHIVE_CONFIRM_DESCRIPTION}</p>
            {archiveMutation.error && (
              <Alert tone="error">
                {getUserFacingApiErrorMessage(archiveMutation.error, T.STATUS_UPDATE_ERROR)}
              </Alert>
            )}
          </>
        }
        confirmLabel={T.ARCHIVE_CONFIRM_BUTTON}
        tone="danger"
        isConfirming={archiveMutation.isPending}
        onConfirm={confirmArchive}
        onClose={() => {
          if (!isBusy) setQuestionToArchive(null);
        }}
      />
      <ConfirmDialog
        open={questionToDelete !== null}
        title={T.DELETE_CONFIRM_TITLE}
        description={
          <>
            <p>{questionToDelete?.content}</p>
            <p>{T.DELETE_CONFIRM_DESCRIPTION}</p>
            {deleteMutation.error && (
              <Alert tone="error">
                {getUserFacingApiErrorMessage(deleteMutation.error, T.STATUS_UPDATE_ERROR)}
              </Alert>
            )}
          </>
        }
        confirmLabel={T.ROW_DELETE_DRAFT}
        tone="danger"
        isConfirming={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isBusy) setQuestionToDelete(null);
        }}
      />
      <RejectQuestionModal
        open={questionToReject !== null}
        isSubmitting={rejectMutation.isPending}
        onConfirm={confirmReject}
        onClose={() => setQuestionToReject(null)}
      />
    </div>
  );
};
