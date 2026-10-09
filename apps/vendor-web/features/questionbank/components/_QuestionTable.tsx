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
  QUESTIONBANK_TEXT,
  QUESTION_POOL_LABELS,
  QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS,
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

const QUESTION_SKILL_FILTER_OPTIONS = [
  { value: "", label: "All skills" },
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
] as const;

const QUESTION_POOL_FILTER_OPTIONS = [
  { value: "", label: "All pools" },
  { value: "exam", label: "Exam" },
  { value: "practice", label: "Practice" },
] as const;

const QUESTION_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending approval" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export const QuestionTable = ({
  questions,
  isLoading = false,
  toolbarActions,
}: QuestionTableProps): ReactElement => {
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
        label: QUESTIONBANK_TEXT.ROW_VIEW_DETAILS,
        icon: DocumentIcon,
        onSelect: () => router.push(`/admin/questions/${question.id}`),
      },
    ];
    if (question.status === "draft") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_SUBMIT,
        icon: UploadIcon,
        onSelect: () =>
          submitMutation.mutate(question.id, {
            onSuccess: () => showToast(QUESTIONBANK_TEXT.SUBMIT_SUCCESS),
          }),
      });
    }
    if (question.status === "pending_approval" && canReview) {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_APPROVE,
        icon: CheckCircleIcon,
        onSelect: () =>
          approveMutation.mutate(question.id, {
            onSuccess: () => showToast(QUESTIONBANK_TEXT.APPROVE_SUCCESS),
          }),
      });
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_REJECT,
        icon: BanIcon,
        onSelect: () => setQuestionToReject(question),
      });
    }
    if (question.canArchive === true) {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_ARCHIVE,
        icon: BanIcon,
        onSelect: () => {
          archiveMutation.reset();
          setQuestionToArchive(question);
        },
      });
    }
    if (question.status === "draft" && question.canDeleteDraft === true) {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_DELETE_DRAFT,
        icon: TrashIcon,
        danger: true,
        onSelect: () => {
          deleteMutation.reset();
          setQuestionToDelete(question);
        },
      });
    } else if (question.status === "draft" && question.canArchive !== true) {
      actions.push({
        label: QUESTIONBANK_TEXT.DELETE_BLOCKED,
        disabled: true,
        onSelect: () => undefined,
      });
    }
    if (question.status === "archived" && canReview) {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_UNARCHIVE,
        icon: CheckCircleIcon,
        onSelect: () =>
          unarchiveMutation.mutate(question.id, {
            onSuccess: () => showToast(QUESTIONBANK_TEXT.UNARCHIVE_SUCCESS),
          }),
      });
    }
    if (question.status === "draft" || question.status === "published") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_EDIT,
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
        showToast(QUESTIONBANK_TEXT.ARCHIVE_SUCCESS);
        setQuestionToArchive(null);
      },
    });
  };

  const confirmDelete = (): void => {
    if (!questionToDelete || isBusy) return;
    deleteMutation.mutate(questionToDelete.id, {
      onSuccess: () => {
        showToast(QUESTIONBANK_TEXT.DELETE_SUCCESS);
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
          showToast(QUESTIONBANK_TEXT.REJECT_SUCCESS);
          setQuestionToReject(null);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {hasMutationError && <Alert tone="error">{QUESTIONBANK_TEXT.STATUS_UPDATE_ERROR}</Alert>}
      <DataTable
        toolbarActions={toolbarActions}
        columns={[
          {
            key: "code",
            label: QUESTION_TABLE_HEADERS.CODE,
            header: QUESTION_TABLE_HEADERS.CODE,
            filterAccessor: (question) => question.id,
            cell: (question) => (
              <span className="font-mono text-xs text-[var(--ink-primary)]">{question.id}</span>
            ),
          },
          {
            key: "skill",
            label: QUESTION_TABLE_HEADERS.SKILL,
            header: QUESTION_TABLE_HEADERS.SKILL,
            filterOptions: QUESTION_SKILL_FILTER_OPTIONS,
            filterAccessor: (question) => question.skill,
            cell: (question) => QUESTION_SKILL_LABELS[question.skill],
          },
          {
            key: "content",
            label: QUESTION_TABLE_HEADERS.CONTENT,
            header: QUESTION_TABLE_HEADERS.CONTENT,
            filterAccessor: (question) => question.content,
            cell: (question) => <span className="line-clamp-1 max-w-xl">{question.content}</span>,
          },
          {
            key: "pool",
            label: QUESTION_TABLE_HEADERS.POOL,
            header: QUESTION_TABLE_HEADERS.POOL,
            filterOptions: QUESTION_POOL_FILTER_OPTIONS,
            filterAccessor: (question) => question.pool,
            cell: (question) => QUESTION_POOL_LABELS[question.pool],
          },
          {
            key: "status",
            label: QUESTION_TABLE_HEADERS.STATUS,
            header: QUESTION_TABLE_HEADERS.STATUS,
            filterOptions: QUESTION_STATUS_FILTER_OPTIONS,
            filterAccessor: (question) => question.status,
            cell: (question) => (
              <Badge variant={QUESTION_STATUS_VARIANT[question.status]}>
                {QUESTION_STATUS_LABELS[question.status]}
              </Badge>
            ),
          },
        ]}
        rows={questions}
        getRowKey={(question) => question.id}
        isLoading={isLoading}
        emptyTitle={QUESTIONBANK_TEXT.EMPTY_TITLE}
        emptyDescription={QUESTIONBANK_TEXT.EMPTY_DESCRIPTION_FILTERED}
        searchPlaceholder={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
        searchAriaLabel={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
        clientSidePagination
        initialPageSize={10}
        tableClassName="min-w-[900px]"
        rowActionsHeader={QUESTION_TABLE_HEADERS.ACTIONS}
        rowActions={(question) => <ActionMenu items={buildActions(question)} />}
      />
      <ConfirmDialog
        open={questionToArchive !== null}
        title={QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_TITLE}
        description={
          <>
            <p>{questionToArchive?.content}</p>
            <p>{QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_DESCRIPTION}</p>
            {archiveMutation.error && (
              <Alert tone="error">
                {getUserFacingApiErrorMessage(
                  archiveMutation.error,
                  QUESTIONBANK_TEXT.STATUS_UPDATE_ERROR,
                )}
              </Alert>
            )}
          </>
        }
        confirmLabel={QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_BUTTON}
        tone="danger"
        isConfirming={archiveMutation.isPending}
        onConfirm={confirmArchive}
        onClose={() => {
          if (!isBusy) setQuestionToArchive(null);
        }}
      />
      <ConfirmDialog
        open={questionToDelete !== null}
        title={QUESTIONBANK_TEXT.DELETE_CONFIRM_TITLE}
        description={
          <>
            <p>{questionToDelete?.content}</p>
            <p>{QUESTIONBANK_TEXT.DELETE_CONFIRM_DESCRIPTION}</p>
            {deleteMutation.error && (
              <Alert tone="error">
                {getUserFacingApiErrorMessage(
                  deleteMutation.error,
                  QUESTIONBANK_TEXT.STATUS_UPDATE_ERROR,
                )}
              </Alert>
            )}
          </>
        }
        confirmLabel={QUESTIONBANK_TEXT.ROW_DELETE_DRAFT}
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
