"use client";
import { createRubricVersion, updateRubricVersion, changeRubricVersionStatus, getRubricVersion, getRubricVersionDiff, getRubricActivations,
  type RubricVersionResponse, type RubricWriteRequest, type RubricStatusRequest, type RubricDiffResponse, type RubricActivationAuditResponse } from "@pte/api-client";
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SCORING_RUBRIC_QUERY_KEYS } from "./constants";

export function useRubricVersion(id: string): UseQueryResult<RubricVersionResponse> {
  return useQuery({ queryKey: [...SCORING_RUBRIC_QUERY_KEYS.all, "version", id], queryFn: () => getRubricVersion(apiClient, id) });
}
export function useVersionDiff(id: string, enabled: boolean): UseQueryResult<RubricDiffResponse> {
  return useQuery({ queryKey: [...SCORING_RUBRIC_QUERY_KEYS.all, "diff", id], queryFn: () => getRubricVersionDiff(apiClient, id), enabled });
}
export function useRubricActivationHistory(id: string): UseQueryResult<RubricActivationAuditResponse[]> {
  return useQuery({ queryKey: [...SCORING_RUBRIC_QUERY_KEYS.all, "activations", id], queryFn: () => getRubricActivations(apiClient, id) });
}
export function useCreateRubricVersion(): UseMutationResult<RubricVersionResponse, Error, RubricWriteRequest> {
  const query = useQueryClient();
  return useMutation({ mutationFn: (body) => createRubricVersion(apiClient, body), onSuccess: async () => {
    await query.invalidateQueries({ queryKey: SCORING_RUBRIC_QUERY_KEYS.all });
  } });
}
export function useUpdateRubricVersion(id: string): UseMutationResult<RubricVersionResponse, Error, RubricWriteRequest> {
  const query = useQueryClient();
  return useMutation({ mutationFn: (body) => updateRubricVersion(apiClient, id, body), onSuccess: async () => {
    await query.invalidateQueries({ queryKey: SCORING_RUBRIC_QUERY_KEYS.all });
  } });
}
export function useRubricVersionStatus(id: string): UseMutationResult<RubricVersionResponse, Error, RubricStatusRequest> {
  const query = useQueryClient();
  return useMutation({ mutationFn: (body) => changeRubricVersionStatus(apiClient, id, body), onSuccess: async () => {
    await query.invalidateQueries({ queryKey: SCORING_RUBRIC_QUERY_KEYS.all });
  }, onError: async () => {
    await query.invalidateQueries({ queryKey: [...SCORING_RUBRIC_QUERY_KEYS.all, "diff", id] });
  } });
}
