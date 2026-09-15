"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listQuestions, type QuestionResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { QUESTION_STATS_QUERY_KEY, QUESTIONS_QUERY_KEY } from "./constants";
import type { Question, QuestionSkill, QuestionStats, QuestionStatus } from "./types";

const SKILL_MAP: Partial<Record<string, QuestionSkill>> = {
  LISTENING: "listening",
  READING: "reading",
  WRITING: "writing",
  SPEAKING: "speaking",
};

function mapStatus(value: QuestionResponse["status"]): QuestionStatus {
  return value === "DRAFT" ? "draft" : "in_use";
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
    content: response.title || response.promptText || "—",
    // The real backend has no difficulty concept at all yet (no field on
    // Question/QuestionResponse) — null rather than a made-up default so the
    // UI can show "—" honestly instead of implying data that doesn't exist.
    difficulty: null,
    // No createdAt on QuestionResponse today either (BaseEntity has it, but
    // the DTO doesn't expose it) — same "—" treatment as difficulty.
    createdAt: null,
    status: mapStatus(response.status),
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
