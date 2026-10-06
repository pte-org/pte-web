"use client";

import {
  approveApplication,
  getApplication,
  archivePlan,
  deletePlan,
  createPlan,
  issueLicenseCode,
  listApplications,
  listAdminLicenseCodes,
  listPlatformSettings,
  listPlans,
  lookupLicenseCode,
  rejectApplication,
  previewLicenseCodeRevoke,
  revealLicenseCode,
  revokeLicenseCode,
  updatePlatformSetting,
  updatePlan,
  activatePlan,
  type IssueLicenseCodeRequest,
  type AdminLicenseCodeListParams,
  type AdminLicenseCodeSummary,
  type LicenseIssueReceipt,
  type LicenseRevokePreviewResponse,
  type LicenseRevokeResponse,
  type ConfirmLicenseRevokeRequest,
  type PlanRequest,
  type PlanResponse,
  type PlanTransitionRequest,
  type PlanUpdateRequest,
  type PlatformSettingRequest,
  type PlatformSettingResponse,
  type RejectApplicationRequest,
  type TenantApplicationResponse,
  type PagedResult,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  APPLICATIONS_QUERY_KEY,
  APPLICATION_QUERY_KEY,
  LICENSE_CODES_QUERY_KEY,
  LICENSE_CODES_PAGE_QUERY_KEY,
  PLANS_QUERY_KEY,
  SETTINGS_QUERY_KEY,
} from "./constants";

export function useApplicationsQuery(): UseQueryResult<TenantApplicationResponse[]> {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: () => listApplications(apiClient),
  });
}

export function useApplicationQuery(
  publicId: string,
): UseQueryResult<TenantApplicationResponse> {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEY(publicId),
    queryFn: () => getApplication(apiClient, publicId),
    enabled: publicId.length > 0,
  });
}

export function useApproveApplication(): UseMutationResult<
  void,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => approveApplication(apiClient, publicId),
    onSuccess: async (_data, publicId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEY(publicId) }),
      ]);
    },
  });
}

export function useRejectApplication(): UseMutationResult<
  TenantApplicationResponse,
  unknown,
  { publicId: string; payload: RejectApplicationRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => rejectApplication(apiClient, publicId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEY(variables.publicId) }),
      ]);
    },
  });
}

export function usePlansQuery(): UseQueryResult<PlanResponse[]> {
  return useQuery({ queryKey: PLANS_QUERY_KEY, queryFn: () => listPlans(apiClient) });
}

export function useCreatePlan(): UseMutationResult<PlanResponse, unknown, PlanRequest> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createPlan(apiClient, payload),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useUpdatePlan(): UseMutationResult<
  PlanResponse,
  unknown,
  { publicId: string; payload: PlanUpdateRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updatePlan(apiClient, publicId, payload),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useActivatePlan(): UseMutationResult<PlanResponse, unknown, { publicId: string; payload: PlanTransitionRequest }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => activatePlan(apiClient, publicId, payload),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useArchivePlan(): UseMutationResult<PlanResponse, unknown, { publicId: string; payload: PlanTransitionRequest }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => archivePlan(apiClient, publicId, payload),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useDeletePlan(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => deletePlan(apiClient, publicId),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function usePlatformSettingsQuery(): UseQueryResult<PlatformSettingResponse[]> {
  return useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: () => listPlatformSettings(apiClient) });
}

export function useUpdatePlatformSetting(): UseMutationResult<
  PlatformSettingResponse,
  unknown,
  { key: string; payload: PlatformSettingRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }) => updatePlatformSetting(apiClient, key, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}

export function useAdminLicenseCodesQuery(
  params: AdminLicenseCodeListParams,
): UseQueryResult<PagedResult<AdminLicenseCodeSummary>> {
  const normalizedParams = {
    page: params.page ?? 0,
    size: params.size ?? 25,
    status: params.status ?? "",
    planId: params.planId ?? "",
    tenantId: params.tenantId ?? "",
  };
  return useQuery({
    queryKey: LICENSE_CODES_PAGE_QUERY_KEY(normalizedParams),
    queryFn: () => listAdminLicenseCodes(apiClient, params),
  });
}

/** Deliberately direct: the bearer input/result must not become a mutation cache entry. */
export function lookupAdminLicenseCode(code: string): Promise<AdminLicenseCodeSummary> {
  return lookupLicenseCode(apiClient, code);
}

/** Deliberately direct: raw bearer response is held only by the caller's local state. */
export function revealAdminLicenseCode(publicId: string): Promise<{ code: string }> {
  return revealLicenseCode(apiClient, publicId);
}

export function useIssueLicenseCode(): UseMutationResult<
  LicenseIssueReceipt,
  unknown,
  { payload: IssueLicenseCodeRequest; idempotencyKey: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => issueLicenseCode(apiClient, payload, idempotencyKey),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: LICENSE_CODES_QUERY_KEY });
    },
  });
}

export function useLicenseCodeRevokePreview(): UseMutationResult<
  LicenseRevokePreviewResponse,
  unknown,
  string
> {
  return useMutation({
    mutationFn: (publicId) => previewLicenseCodeRevoke(apiClient, publicId),
  });
}

export function useRevokeLicenseCode(): UseMutationResult<
  LicenseRevokeResponse,
  unknown,
  { publicId: string; payload: ConfirmLicenseRevokeRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => revokeLicenseCode(apiClient, publicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LICENSE_CODES_QUERY_KEY });
    },
  });
}
