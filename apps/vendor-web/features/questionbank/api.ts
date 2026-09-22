"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  archiveQuestion,
  approveQuestion,
  createQuestion,
  createQuestionRevision,
  getMediaPreview,
  getQuestion,
  listQuestions,
  publishQuestion,
  rejectQuestion,
  submitQuestionApproval,
  updateQuestion,
  unarchiveQuestion,
  type CreateQuestionRequest,
  type MediaPreviewResponse,
  type QuestionResponse,
  type UpdateQuestionRequest,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { QUESTION_STATS_QUERY_KEY, QUESTIONS_QUERY_KEY } from "./constants";
import type { Question, QuestionSkill, QuestionStats, QuestionStatus } from "./types";

const SKILL_MAP: Partial<Record<string, QuestionSkill>> = {
  LISTENING: "listening",
  READING: "reading",
  WRITING: "writing",
  SPEAKING: "speaking",
};

const STATUS_MAP: Record<string, QuestionStatus> = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "published",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

function mapStatus(value: QuestionResponse["status"]): QuestionStatus {
  return STATUS_MAP[value] ?? "draft";
}

/**
 * `QuestionResponse` has no `content`/single string field — `title` is the
 * one human-readable label the backend always sets; `promptText` is null
 * for options-only task types (e.g. RE_ORDER_PARAGRAPHS), so it's a fallback,
 * not the primary source.
 */
function mapQuestion(response: QuestionResponse): Question {
  return {
    id: response.publicId,
    skill: SKILL_MAP[response.section] ?? "reading",
    taskType: response.pteTaskType,
    content: response.title || response.promptText || "—",
    status: mapStatus(response.status),
    rejectionReason: response.rejectionReason,
  };
}

function buildStats(questions: Question[]): QuestionStats {
  const countBySkill = (skill: Question["skill"]): number =>
    questions.filter((question) => question.skill === skill).length;
  const draft = questions.filter((question) => question.status === "draft");

  return {
    total: String(questions.length),
    totalTrend: "",
    listening: String(countBySkill("listening")),
    listeningNote: "",
    reading: String(countBySkill("reading")),
    readingNote: "",
    writing: String(countBySkill("writing")),
    writingNote: "",
    speaking: String(countBySkill("speaking")),
    speakingNote: "",
    draft: String(draft.length),
    draftNote: "",
  };
}

async function fetchQuestions(): Promise<Question[]> {
  const result = await listQuestions(apiClient);
  return result.map(mapQuestion);
}

export function useQuestions(): UseQueryResult<Question[]> {
  return useQuery({
    queryKey: QUESTIONS_QUERY_KEY,
    queryFn: fetchQuestions,
  });
}

export function useQuestionStats(): UseQueryResult<QuestionStats> {
  return useQuery({
    queryKey: QUESTION_STATS_QUERY_KEY,
    queryFn: async () => buildStats(await fetchQuestions()),
  });
}

export function useQuestion(publicId: string): UseQueryResult<QuestionResponse> {
  return useQuery({
    queryKey: [...QUESTIONS_QUERY_KEY, publicId],
    queryFn: () => getQuestion(apiClient, publicId),
    enabled: Boolean(publicId),
  });
}

export const MEDIA_PREVIEW_QUERY_KEY = ["questionMediaPreview"] as const;

export function useMediaPreview(
  mediaPublicId: string | null | undefined,
): UseQueryResult<MediaPreviewResponse> {
  return useQuery({
    queryKey: [...MEDIA_PREVIEW_QUERY_KEY, mediaPublicId],
    queryFn: () => getMediaPreview(apiClient, mediaPublicId as string),
    enabled: Boolean(mediaPublicId),
    staleTime: 30_000,
    retry: 1,
  });
}

function useInvalidateQuestionsOnSuccess(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: QUESTION_STATS_QUERY_KEY });
  };
}

export function usePublishQuestion(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({
    mutationFn: (id: string) => publishQuestion(apiClient, id),
    onSuccess,
  });
}

export function useArchiveQuestion(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({
    mutationFn: (id: string) => archiveQuestion(apiClient, id),
    onSuccess,
  });
}

export function useUnarchiveQuestion(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({
    mutationFn: (id: string) => unarchiveQuestion(apiClient, id),
    onSuccess,
  });
}

export function useCreateQuestion(): UseMutationResult<
  QuestionResponse,
  unknown,
  CreateQuestionRequest
> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({ mutationFn: (payload) => createQuestion(apiClient, payload), onSuccess });
}

export function useUpdateQuestion(): UseMutationResult<
  QuestionResponse,
  unknown,
  { id: string; payload: UpdateQuestionRequest }
> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({
    mutationFn: ({ id, payload }) => updateQuestion(apiClient, id, payload),
    onSuccess,
  });
}

export function useCreateQuestionRevision(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({ mutationFn: (id) => createQuestionRevision(apiClient, id), onSuccess });
}

export function useSubmitQuestionApproval(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({ mutationFn: (id) => submitQuestionApproval(apiClient, id), onSuccess });
}

export function useApproveQuestion(): UseMutationResult<QuestionResponse, unknown, string> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({ mutationFn: (id) => approveQuestion(apiClient, id), onSuccess });
}

export function useRejectQuestion(): UseMutationResult<
  QuestionResponse,
  unknown,
  { id: string; reason: string }
> {
  const onSuccess = useInvalidateQuestionsOnSuccess();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectQuestion(apiClient, id, reason),
    onSuccess,
  });
}
