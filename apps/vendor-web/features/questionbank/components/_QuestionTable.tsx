import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu, Alert, Badge, type ActionMenuItem } from "@pte/ui";
import {
  useApproveQuestion,
  useArchiveQuestion,
  useRejectQuestion,
  useSubmitQuestionApproval,
  useUnarchiveQuestion,
} from "../api";
import {
  QUESTIONBANK_TEXT,
  QUESTION_DIFFICULTY_VARIANT,
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
  const submitMutation = useSubmitQuestionApproval();
  const approveMutation = useApproveQuestion();
  const rejectMutation = useRejectQuestion();
  const archiveMutation = useArchiveQuestion();
  const unarchiveMutation = useUnarchiveQuestion();
  const hasMutationError =
    submitMutation.isError ||
    approveMutation.isError ||
    rejectMutation.isError ||
    archiveMutation.isError ||
    unarchiveMutation.isError;

  const buildActions = (question: Question): ActionMenuItem[] => {
    const actions: ActionMenuItem[] = [];
    if (question.status === "draft") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_SUBMIT,
        onSelect: () => submitMutation.mutate(question.id),
      });
    }
    if (question.status === "pending_approval") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_APPROVE,
        onSelect: () => approveMutation.mutate(question.id),
      });
      actions.push({
        label: "Reject",
        onSelect: () => {
          const reason = window.prompt(
            QUESTIONBANK_TEXT.REJECTION_REASON_PROMPT,
            QUESTIONBANK_TEXT.REJECTION_REASON_DEFAULT,
          );
          if (reason?.trim()) rejectMutation.mutate({ id: question.id, reason });
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
        onSelect: () => archiveMutation.mutate(question.id),
      });
    }
    if (question.status === "archived") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_UNARCHIVE,
        onSelect: () => unarchiveMutation.mutate(question.id),
      });
    }
    if (question.status === "draft" || question.status === "published") {
      actions.push({
        label: QUESTIONBANK_TEXT.ROW_EDIT,
        onSelect: () => router.push(`/admin/questions/${question.id}/edit`),
      });
    }
    return actions;
  };

  return (
    <div className="space-y-4">
      {hasMutationError && (
        <Alert tone="error">{QUESTIONBANK_TEXT.STATUS_UPDATE_ERROR}</Alert>
      )}
      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CODE}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.SKILL}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CONTENT}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.DIFFICULTY}</th>
                <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CREATED}</th>
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
                    {question.difficulty ? (
                      <Badge variant={QUESTION_DIFFICULTY_VARIANT[question.difficulty]}>
                        {question.difficulty}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className={`${CELL_CLASS} text-gray-500`}>
                    {question.createdAt ?? QUESTIONBANK_TEXT.EMPTY_VALUE}
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
    </div>
  );
};
