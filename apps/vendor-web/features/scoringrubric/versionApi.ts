"use client";
import { listRubricTaskTypes, simulateScore, createRubricVersion, updateRubricVersion, changeRubricVersionStatus, getRubricVersion, getRubricVersionDiff, getRubricActivations,
  type RubricVersionResponse, type RubricWriteRequest, type RubricStatusRequest, type RubricDiffResponse, type RubricActivationAuditResponse } from "@pte/api-client";
import { useQueries, useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SCORING_RUBRIC_QUERY_KEYS } from "./constants";
import type { ImpactScenario } from "./versionImpact";
import { parametersFromRubrics } from "./versionEditing";

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
/** A status change on any version of the list, e.g. discarding a draft from its row. */
export function useRubricVersionStatusById(): UseMutationResult<RubricVersionResponse, Error, { id: string; request: RubricStatusRequest }> {
  const query = useQueryClient();
  return useMutation({ mutationFn: ({ id, request }) => changeRubricVersionStatus(apiClient, id, request), onSuccess: async () => {
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

/** One sample answer scored by the active rubric and by the candidate; both numbers come from the server. */
export interface ImpactSample {
  before: number | null;
  after: number | null;
  failed: boolean;
  pending: boolean;
}

export function useImpactSamples(
  scenarios: readonly ImpactScenario[],
  activeVersionId: string,
  candidateVersionId: string,
  /** The diff digest: it changes whenever the draft does, so cached samples never outlive an edit. */
  diffDigest: string,
): ImpactSample[] {
  const queries = useQueries({
    queries: scenarios.flatMap((scenario) => [activeVersionId, candidateVersionId].map((versionId) => ({
      queryKey: [...SCORING_RUBRIC_QUERY_KEYS.all, "impact", versionId, diffDigest, scenario.request],
      queryFn: () => simulateScore(apiClient, { ...scenario.request, rubricVersionPublicId: versionId }),
      staleTime: Infinity,
      retry: false,
    }))),
  });
  return scenarios.map((_scenario, index) => {
    const before = queries[index * 2];
    const after = queries[index * 2 + 1];
    return {
      before: before.data?.rawScore ?? null,
      after: after.data?.rawScore ?? null,
      failed: before.isError || after.isError,
      pending: before.isPending || after.isPending,
    };
  });
}

/** A new draft that starts from the numbers of the given version, active or past. */
export function useCloneRubricVersion(): UseMutationResult<RubricVersionResponse, Error, string> {
  const query = useQueryClient();
  return useMutation({
    mutationFn: async (sourceVersionId) => createRubricVersion(apiClient, {
      parameters: parametersFromRubrics(await listRubricTaskTypes(apiClient, sourceVersionId)),
    }),
    onSuccess: async () => {
      await query.invalidateQueries({ queryKey: SCORING_RUBRIC_QUERY_KEYS.all });
    },
  });
}
