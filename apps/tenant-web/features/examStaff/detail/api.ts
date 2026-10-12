"use client";

import {
  getExamStaffDetail, getExamStaffOverview, listExaminerStaffSessions, listProctorStaffSessions,
  updateExamStaffProfile, type ExamStaffAccountResponse, type ExaminerSessionPage,
  type ProctorSessionPage, type StaffOverviewResponse, type StaffWorkspaceQuery,
  type UpdateExamStaffProfileRequest,
} from "@pte/api-client";
import {
  useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult,
} from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/api";
import { apiClient } from "@/lib/apiClient";
import { getSessionGeneration } from "@pte/ui";
import { EXAM_STAFF_QUERY_KEY } from "../constants";
import { STAFF_PREVIEW_PAGE_SIZE, STAFF_WORKSPACE_QUERY_KEY } from "./constants";

/** Every selected-staff read is isolated by authenticated tenant and target public ID. */
const useWorkspaceScope = (publicId: string): { key: readonly unknown[]; ready: boolean } => {
  const { data: user } = useCurrentUser();
  return {
    key: [...STAFF_WORKSPACE_QUERY_KEY, user?.tenantId ?? "", publicId],
    ready: Boolean(user?.tenantId && publicId && user.roles.includes("HOST_ADMIN")),
  };
};

export const useStaffDetail = (publicId: string): UseQueryResult<ExamStaffAccountResponse> => {
  const scope = useWorkspaceScope(publicId);
  return useQuery({
    queryKey: scope.key, enabled: scope.ready,
    queryFn: ({ signal }) => getExamStaffDetail(apiClient, publicId, signal),
  });
};

export const useStaffOverview = (
  publicId: string, query: StaffWorkspaceQuery, enabled: boolean,
): UseQueryResult<StaffOverviewResponse> => {
  const scope = useWorkspaceScope(publicId);
  return useQuery({
    queryKey: [...scope.key, "overview", query], enabled: scope.ready && enabled,
    queryFn: ({ signal }) => getExamStaffOverview(apiClient, publicId, query, signal),
  });
};

export const useStaffProctorSessions = (
  publicId: string, query: StaffWorkspaceQuery, enabled: boolean,
): UseQueryResult<ProctorSessionPage> => {
  const scope = useWorkspaceScope(publicId);
  return useQuery({
    queryKey: [...scope.key, "proctor", query], enabled: scope.ready && enabled,
    queryFn: ({ signal }) => listProctorStaffSessions(apiClient, publicId, query, signal),
  });
};

export const useStaffExaminerSessions = (
  publicId: string, query: StaffWorkspaceQuery, enabled: boolean,
): UseQueryResult<ExaminerSessionPage> => {
  const scope = useWorkspaceScope(publicId);
  return useQuery({
    queryKey: [...scope.key, "examiner", query], enabled: scope.ready && enabled,
    queryFn: ({ signal }) => listExaminerStaffSessions(apiClient, publicId, query, signal),
  });
};

/** Refresh the overlap bound on every fetch, not only when the profile mounts. */
export const useNextStaffProctorSessions = (publicId: string, enabled: boolean): UseQueryResult<ProctorSessionPage> => {
  const scope = useWorkspaceScope(publicId);
  return useQuery({
    queryKey: [...scope.key, "proctor-preview"], enabled: scope.ready && enabled,
    queryFn: ({ signal }) => listProctorStaffSessions(apiClient, publicId, {
      from: new Date().toISOString(), sessionStatus: "SCHEDULED", direction: "asc", page: 0, size: STAFF_PREVIEW_PAGE_SIZE,
    }, signal),
  });
};

export const useUpdateStaffProfile = (): UseMutationResult<
  ExamStaffAccountResponse, unknown, { publicId: string; payload: UpdateExamStaffProfileRequest },
  { key: readonly unknown[]; generation: number }
> => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    onMutate: async ({ publicId }) => {
      const key = [...STAFF_WORKSPACE_QUERY_KEY, user?.tenantId ?? "", publicId];
      const generation = getSessionGeneration();
      await queryClient.cancelQueries({ queryKey: key, exact: true });
      return { key, generation };
    },
    mutationFn: ({ publicId, payload }) => updateExamStaffProfile(apiClient, publicId, payload),
    onSuccess: async (account, _variables, context) => {
      if (!context || context.generation !== getSessionGeneration()) return;
      // A focus/refetch during the mutation must not overwrite the authoritative save response.
      await queryClient.cancelQueries({ queryKey: context.key, exact: true });
      if (context.generation !== getSessionGeneration()) return;
      queryClient.setQueryData(context.key, account);
      void queryClient.invalidateQueries({ queryKey: EXAM_STAFF_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["tenantUsers"] });
    },
  });
};
