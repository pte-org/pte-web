"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Button,
  Chip,
  Input,
  LoadingState,
  Pagination,
  Tabs,
  useToast,
} from "@pte/ui";
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
import { cefrTone } from "@/lib/chipTones";
import {
  EXAM_STUDIO_ROUTE,
  EXAM_STUDIO_TEXT,
  QUESTION_ROUTE,
  STUDIO_QUESTION_PAGE_SIZE,
} from "../constants";
import type { StudioTile } from "../types";
import { useSettled } from "../hooks/useSettled";
import { SERVER_STATUS, STATUS_BADGE, statusLabelsOf } from "./questionStatus";

interface QuestionsSectionProps {
  tile: StudioTile;
  templatePublicId: string;
}

const ALL = "all";
const STATUS_ORDER: readonly QuestionStatus[] = ["published", "pending_approval", "draft"];
/** How many questions of the task type have the status; asks the server for one row and reads the total. */
function useStatusCount(
  taskType: string,
  status: QuestionStatus | null,
  query: string,
): number | undefined {
  const result = useQuestions(
    { taskType, q: query || undefined, ...(status ? { status: SERVER_STATUS[status] } : {}) },
    0,
    1,
  );
  return result.data?.meta.totalElements;
}

/**
 * The questions of one task type, a page at a time: the filtering, the search and the paging are done
 * by the server, so the list stays quick however many questions the task type has.
 */
export const QuestionsSection = ({
  tile,
  templatePublicId,
}: QuestionsSectionProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const statusLabels = statusLabelsOf(text);
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [filter, setFilter] = useState<string>(ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = useSettled(search.trim());
  const status = filter === ALL ? null : (filter as QuestionStatus);
  const questions = useQuestions(
    {
      taskType: tile.key,
      q: query || undefined,
      ...(status ? { status: SERVER_STATUS[status] } : {}),
    },
    page,
    STUDIO_QUESTION_PAGE_SIZE,
  );
  const counts: Record<string, number | undefined> = {
    [ALL]: useStatusCount(tile.key, null, query),
    published: useStatusCount(tile.key, "published", query),
    pending_approval: useStatusCount(tile.key, "pending_approval", query),
    draft: useStatusCount(tile.key, "draft", query),
  };
  const submitMutation = useSubmitQuestionApproval();
  const approveMutation = useApproveQuestion();
  const busy = submitMutation.isPending || approveMutation.isPending;

  // Approving changes how many questions the template can draw, so the coverage must be read again.
  const refreshCoverage = (): void => {
    void queryClient.invalidateQueries({
      queryKey: [...SCORE_TEMPLATE_QUERY_KEY, templatePublicId, "feasibility"],
    });
  };
  const options = {
    onSuccess: refreshCoverage,
    onError: () => showToast(text.ACTION_ERROR, { tone: "error" }),
  };

  if (questions.isError) return <Alert tone="error">{text.QUESTIONS_ERROR}</Alert>;

  const shown = questions.data?.data ?? [];
  const totalPages = questions.data?.meta.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
      <Tabs
        id="studio-question-status"
        variant="minimal"
        ariaLabel={text.QUESTIONS_SECTION}
        items={[
          { id: ALL, label: text.FILTER_ALL, count: counts[ALL] },
          ...STATUS_ORDER.map((entry) => ({
            id: entry,
            label: statusLabels[entry],
            count: counts[entry],
          })),
        ]}
        value={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(0);
        }}
        className="px-2"
      />
      <div className="border-t border-[var(--shell-border)] p-2">
        <Input
          type="search"
          aria-label={text.QUESTION_SEARCH}
          placeholder={text.QUESTION_SEARCH}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />
      </div>
      {questions.isLoading && <LoadingState />}
      {!questions.isLoading && shown.length === 0 && (
        <p className="border-t border-[var(--shell-border)] px-4 py-6 text-center text-sm text-[var(--ink-secondary)]">
          {text.NO_QUESTIONS}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="max-h-[50vh] divide-y divide-[var(--shell-border)] overflow-y-auto border-t border-[var(--shell-border)]">
          {shown.map((question) => (
            <li key={question.id} className="flex items-center gap-2 px-1 py-1">
              <button
                type="button"
                onClick={() =>
                  router.push(`${QUESTION_ROUTE}/${question.id}?from=${EXAM_STUDIO_ROUTE}`)
                }
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--action-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                title={question.content}
              >
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink-primary)]">
                  {question.content}
                </span>
                {question.cefrLevel && (
                  <Chip tone={cefrTone(question.cefrLevel)} size="sm">
                    {question.cefrLevel}
                  </Chip>
                )}
                <Badge variant={STATUS_BADGE[question.status]}>
                  {statusLabels[question.status]}
                </Badge>
              </button>
              {question.status === "draft" && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => submitMutation.mutate(question.id, options)}
                >
                  {text.SUBMIT_APPROVAL}
                </Button>
              )}
              {question.status === "pending_approval" && canReviewAcademic(currentUser?.roles) && (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => approveMutation.mutate(question.id, options)}
                >
                  {text.APPROVE}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="border-t border-[var(--shell-border)] p-2">
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(next) => setPage(next - 1)}
            sideLayout="icon"
          />
        </div>
      )}
    </div>
  );
};
