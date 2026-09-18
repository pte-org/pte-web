"use client";

import {
  approveBlueprint,
  createBlueprint,
  getBlueprint,
  listBlueprints,
  rejectBlueprint,
  submitBlueprintApproval,
  updateBlueprint,
  type ExamBlueprintResponse,
  type CreateBlueprintRequest,
  type ExamSnapshotResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { BLUEPRINT_QUERY_KEY, BLUEPRINTS_QUERY_KEY } from "./constants";

export function useBlueprints(): UseQueryResult<ExamBlueprintResponse[]> {
  return useQuery({
    queryKey: BLUEPRINTS_QUERY_KEY,
    queryFn: () => listBlueprints(apiClient),
  });
}

export function useBlueprint(publicId?: string): UseQueryResult<ExamBlueprintResponse> {
  return useQuery({
    queryKey: [...BLUEPRINT_QUERY_KEY, publicId],
    queryFn: () => getBlueprint(apiClient, publicId ?? ""),
    enabled: Boolean(publicId),
  });
}

function useInvalidateBlueprints(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: BLUEPRINTS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: BLUEPRINT_QUERY_KEY });
  };
}

export function useCreateBlueprint(): UseMutationResult<ExamBlueprintResponse, unknown, CreateBlueprintRequest> {
  const invalidate = useInvalidateBlueprints();
  return useMutation({ mutationFn: (payload) => createBlueprint(apiClient, payload), onSuccess: invalidate });
}

export function useUpdateBlueprint(): UseMutationResult<
  ExamBlueprintResponse,
  unknown,
  { publicId: string; payload: CreateBlueprintRequest }
> {
  const invalidate = useInvalidateBlueprints();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updateBlueprint(apiClient, publicId, payload),
    onSuccess: invalidate,
  });
}

export function useSubmitBlueprintApproval(): UseMutationResult<ExamBlueprintResponse, unknown, string> {
  const invalidate = useInvalidateBlueprints();
  return useMutation({
    mutationFn: (publicId) => submitBlueprintApproval(apiClient, publicId),
    onSuccess: invalidate,
  });
}

export function useApproveBlueprint(): UseMutationResult<ExamSnapshotResponse, unknown, string> {
  const invalidate = useInvalidateBlueprints();
  return useMutation({ mutationFn: (publicId) => approveBlueprint(apiClient, publicId), onSuccess: invalidate });
}

export function useRejectBlueprint(): UseMutationResult<
  ExamBlueprintResponse,
  unknown,
  { publicId: string; reason: string }
> {
  const invalidate = useInvalidateBlueprints();
  return useMutation({
    mutationFn: ({ publicId, reason }) => rejectBlueprint(apiClient, publicId, reason),
    onSuccess: invalidate,
  });
}
