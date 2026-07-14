"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listQuestions,
  type QuestionResponse,
} from "@aptis/api-client";
import { apiClient } from "@/lib/apiClient";
import type {
  Question,
  QuestionDifficulty,
  QuestionSkill,
  QuestionStats,
  QuestionStatus,
} from "./types";

const QUESTIONS_QUERY_KEY = ["questions"] as const;

const SKILL_MAP: Partial<Record<QuestionResponse["skill"], QuestionSkill>> = {
  LISTENING: "listening",
  READING: "reading",
  WRITING: "writing",
  SPEAKING: "speaking",
};

function mapDifficulty(value: QuestionResponse["difficultyLevel"]): QuestionDifficulty {
  return value === "C1" ? "C" : value;
}

function mapStatus(value: QuestionResponse["status"]): QuestionStatus {
  return value === "DRAFT" ? "draft" : "in_use";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB").format(date);
}

function mapQuestion(response: QuestionResponse): Question {
  return {
    id: response.id,
    skill: SKILL_MAP[response.skill] ?? "reading",
    content: response.content,
    difficulty: mapDifficulty(response.difficultyLevel),
    createdAt: formatDate(response.createdAt),
    status: mapStatus(response.status),
  };
}

function buildStats(questions: Question[]): QuestionStats {
  const listening = questions.filter((question) => question.skill === "listening");
  const reading = questions.filter((question) => question.skill === "reading");
  const draft = questions.filter((question) => question.status === "draft");

  return {
    total: String(questions.length),
    totalTrend: "",
    listening: String(listening.length),
    listeningNote: "",
    reading: String(reading.length),
    readingNote: "",
    draft: String(draft.length),
    draftNote: "",
  };
}

async function fetchQuestions(): Promise<Question[]> {
  const result = await listQuestions(apiClient, { size: 100 });
  return result.data.map(mapQuestion);
}

export function useQuestions(): UseQueryResult<Question[]> {
  return useQuery({
    queryKey: QUESTIONS_QUERY_KEY,
    queryFn: fetchQuestions,
  });
}

export function useQuestionStats(): UseQueryResult<QuestionStats> {
  return useQuery({
    queryKey: ["questionStats"],
    queryFn: async () => buildStats(await fetchQuestions()),
  });
}
