"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  changeQuestionVoice,
  getQuestionVoiceCatalog,
  getQuestionVoiceSample,
  type ChangeQuestionVoiceRequest,
  type QuestionResponse,
  type QuestionVoiceCatalogResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { QUESTIONS_QUERY_KEY } from "./constants";
import {
  VOICE_CATALOG_QUERY_KEY,
  VOICE_SAMPLE_QUERY_KEY,
  VOICE_STATIC_STALE_MS,
} from "./voiceConstants";

/** The voices that are switched on; changes only with a deployment, so it is kept for an hour. */
export function useVoiceCatalog(enabled = true): UseQueryResult<QuestionVoiceCatalogResponse> {
  return useQuery({
    queryKey: VOICE_CATALOG_QUERY_KEY,
    queryFn: () => getQuestionVoiceCatalog(apiClient),
    enabled,
    staleTime: VOICE_STATIC_STALE_MS,
  });
}

/** Fetches (once per voice) the sample of a voice, only when a person asks to hear it. */
export function useVoiceSampleLoader(): (voice: string) => Promise<Blob> {
  const queryClient = useQueryClient();
  return (voice) =>
    queryClient.fetchQuery({
      queryKey: [...VOICE_SAMPLE_QUERY_KEY, voice],
      queryFn: () => getQuestionVoiceSample(apiClient, voice),
      staleTime: VOICE_STATIC_STALE_MS,
    });
}

/** Speaks the question again with another voice, then refreshes it so the new audio and meta show. */
export function useChangeVoice(
  questionId: string,
): UseMutationResult<QuestionResponse, Error, ChangeQuestionVoiceRequest> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeQuestionVoiceRequest) =>
      changeQuestionVoice(apiClient, questionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
  });
}
