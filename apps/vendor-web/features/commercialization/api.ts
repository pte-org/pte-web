"use client";

import {
  approveApplication,
  archivePlan,
  createPlan,
  issueLicenseCode,
  listApplications,
  listLicenseCodes,
  listPlatformSettings,
  listPlans,
  rejectApplication,
  revokeLicenseCode,
  updatePlatformSetting,
  updatePlan,
  activatePlan,
  type IssueLicenseCodeRequest,
  type LicenseCodeResponse,
  type PlanRequest,
  type PlanResponse,
  type PlatformSettingRequest,
  type PlatformSettingResponse,
  type RejectApplicationRequest,
  type TenantApplicationResponse,
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
  LICENSE_CODES_QUERY_KEY,
  PLANS_QUERY_KEY,
  SETTINGS_QUERY_KEY,
} from "./constants";

export function useApplicationsQuery(): UseQueryResult<TenantApplicationResponse[]> {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: () => listApplications(apiClient),
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useUpdatePlan(): UseMutationResult<
  PlanResponse,
  unknown,
  { publicId: string; payload: PlanRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updatePlan(apiClient, publicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useActivatePlan(): UseMutationResult<PlanResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => activatePlan(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });
}

export function useArchivePlan(): UseMutationResult<PlanResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => archivePlan(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
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

export function useLicenseCodesQuery(): UseQueryResult<LicenseCodeResponse[]> {
  return useQuery({
    queryKey: LICENSE_CODES_QUERY_KEY,
    queryFn: () => listLicenseCodes(apiClient),
  });
}

export function useIssueLicenseCode(): UseMutationResult<
  LicenseCodeResponse,
  unknown,
  IssueLicenseCodeRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => issueLicenseCode(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LICENSE_CODES_QUERY_KEY });
    },
  });
}

export function useRevokeLicenseCode(): UseMutationResult<
  LicenseCodeResponse,
  unknown,
  { code: string; reason: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, reason }) => revokeLicenseCode(apiClient, code, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LICENSE_CODES_QUERY_KEY });
    },
  });
}
