import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Badge,
  BanIcon,
  CheckCircleIcon,
  ConfirmDialog,
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
  useRejectQuestion,
  useSubmitQuestionApproval,
  useUnarchiveQuestion,
} from "../api";
import {
  QUESTIONBANK_TEXT,
  QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS,
} from "../constants";
import type { Question } from "../types";

interface QuestionTableProps {
  questions: Question[];
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

export const QuestionTable = ({ questions }: QuestionTableProps): ReactElement => {
  const router = useRouter();
  const { showToast } = useToast();
  const submitMutation = useSubmitQuestionApproval();
  const approveMutation = useApproveQuestion();
  const rejectMutation = useRejectQuestion();
  const archiveMutation = useArchiveQuestion();
  const unarchiveMutation = useUnarchiveQuestion();
  const [questionToArchive, setQuestionToArchive] = useState<Question | null>(null);
  const hasMutationError =
    submitMutation.isError ||
    approveMutation.isError ||
    rejectMutation.isError ||
    archiveMutation.isError ||
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
    if (question.status === "pending_approval") {
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
        onSelect: () => {
          const reason = window.prompt(
            QUESTIONBANK_TEXT.REJECTION_REASON_PROMPT,
            QUESTIONBANK_TEXT.REJECTION_REASON_DEFAULT,
          );
          if (reason?.trim())
            rejectMutation.mutate(
              { id: question.id, reason },
              { onSuccess: () => showToast(QUESTIONBANK_TEXT.REJECT_SUCCESS) },
            );
        },
      });
    }
    if (
      question.status === "draft" ||
      question.status === "pending_approval" ||
      question.status === "published"
    ) {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_ARCHIVE,
        icon: TrashIcon,
        onSelect: () => setQuestionToArchive(question),
      });
    }
    if (question.status === "archived") {
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
    return actions;
  };

  const confirmArchive = (): void => {
    if (!questionToArchive) return;
    archiveMutation.mutate(questionToArchive.id, {
      onSuccess: () => showToast(QUESTIONBANK_TEXT.ARCHIVE_SUCCESS),
    });
    setQuestionToArchive(null);
  };

  return (
    <div className="space-y-4">
      {hasMutationError && <Alert tone="error">{QUESTIONBANK_TEXT.STATUS_UPDATE_ERROR}</Alert>}
      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CODE}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.SKILL}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CONTENT}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.STATUS}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="border-t border-gray-100 hover:bg-slate-50/70">
                  <td className={`${CELL_CLASS} font-mono text-xs text-gray-900`}>{question.id}</td>
                  <td className={CELL_CLASS}>{QUESTION_SKILL_LABELS[question.skill]}</td>
                  <td className={`${CELL_CLASS} max-w-xs`}>
                    <span className="line-clamp-1">{question.content}</span>
                  </td>
                  <td className={CELL_CLASS}>
                    <Badge variant={QUESTION_STATUS_VARIANT[question.status]}>
                      {QUESTION_STATUS_LABELS[question.status]}
                    </Badge>
                  </td>
                  <td className={CELL_CLASS}>
                    <ActionMenu items={buildActions(question)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        open={questionToArchive !== null}
        title={QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_TITLE}
        description={QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_DESCRIPTION}
        confirmLabel={QUESTIONBANK_TEXT.ARCHIVE_CONFIRM_BUTTON}
        tone="danger"
        isConfirming={archiveMutation.isPending}
        onConfirm={confirmArchive}
        onClose={() => setQuestionToArchive(null)}
      />
    </div>
  );
};
