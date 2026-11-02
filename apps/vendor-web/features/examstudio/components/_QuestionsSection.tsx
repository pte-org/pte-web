"use client";

import type { ReactElement } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Badge, Button, LoadingState, useToast, type BadgeVariant } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useApproveQuestion,
  useQuestions,
  useSubmitQuestionApproval,
} from "@/features/questionbank/api";
import type { QuestionStatus } from "@/features/questionbank/types";
import { SCORE_TEMPLATE_QUERY_KEY } from "@/features/scoretemplate/constants";
import { EXAM_STUDIO_TEXT, STUDIO_QUESTION_PAGE_SIZE } from "../constants";
import type { StudioTile } from "../types";

interface QuestionsSectionProps {
  tile: StudioTile;
  templatePublicId: string;
}

const STATUS_BADGE: Record<QuestionStatus, BadgeVariant> = {
  draft: "neutral",
  pending_approval: "warning",
  published: "success",
  archived: "neutral",
};

export const QuestionsSection = ({ tile, templatePublicId }: QuestionsSectionProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const statusLabels: Record<QuestionStatus, string> = {
    draft: text.STATUS_DRAFT,
    pending_approval: text.STATUS_PENDING,
    published: text.STATUS_PUBLISHED,
    archived: text.STATUS_ARCHIVED,
  };
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const questions = useQuestions({ taskType: tile.key }, 0, STUDIO_QUESTION_PAGE_SIZE);
  const submitMutation = useSubmitQuestionApproval();
  const approveMutation = useApproveQuestion();
  const busy = submitMutation.isPending || approveMutation.isPending;

  // Approving changes how many questions the template can draw, so the coverage must be read again.
  const refreshCoverage = (): void => {
    void queryClient.invalidateQueries({ queryKey: [...SCORE_TEMPLATE_QUERY_KEY, templatePublicId, "feasibility"] });
  };
  const options = {
    onSuccess: refreshCoverage,
    onError: () => showToast(text.ACTION_ERROR, { tone: "error" }),
  };

  if (questions.isLoading) return <LoadingState />;
  if (questions.isError) return <Alert tone="error">{text.QUESTIONS_ERROR}</Alert>;

  const list = questions.data?.data ?? [];
  const approved = list.filter((question) => question.status === "published").length;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
          {text.QUESTIONS_HEADING.replace("{approved}", String(approved)).replace(
            "{pending}",
            String(list.length - approved),
          )}
        </p>
      </div>
      {list.length === 0 && <p className="text-sm text-[var(--ink-secondary)]">{text.NO_QUESTIONS}</p>}
      <ul className="divide-y divide-[var(--shell-border)]">
        {list.map((question) => (
          <li key={question.id} className="flex items-center gap-2 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink-primary)]" title={question.content}>
              {question.content}
            </span>
            <Badge variant={STATUS_BADGE[question.status]}>{statusLabels[question.status]}</Badge>
            {question.status === "draft" && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => submitMutation.mutate(question.id, options)}>
                {text.SUBMIT_APPROVAL}
              </Button>
            )}
            {question.status === "pending_approval" && canReviewAcademic(currentUser?.roles) && (
              <Button size="sm" disabled={busy} onClick={() => approveMutation.mutate(question.id, options)}>
                {text.APPROVE}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
