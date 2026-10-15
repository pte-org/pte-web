"use client";

import {
  listVietnamProvinces,
  listVietnamWards,
  updateMyOrganization,
  updateOwnProfile,
  type CurrentUser,
  type LocationOption,
  type OrganizationResponse,
  type UpdateOrganizationProfileRequest,
  type UpdateOwnProfileRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { CURRENT_USER_QUERY_KEY } from "@/features/auth/constants";
import { MY_ORGANIZATIONS_QUERY_KEY } from "@/features/programs/constants";
import { PROFILE_LOCATION_STALE_TIME_MS } from "./constants";

export const VIETNAM_PROVINCES_QUERY_KEY = ["locations", "vietnam", "provinces"] as const;

export function useVietnamProvinces(): UseQueryResult<LocationOption[]> {
  return useQuery({
    queryKey: VIETNAM_PROVINCES_QUERY_KEY,
    queryFn: () => listVietnamProvinces(apiClient),
    staleTime: PROFILE_LOCATION_STALE_TIME_MS,
  });
}

export function useVietnamWards(provinceCode: string | null): UseQueryResult<LocationOption[]> {
  return useQuery({
    queryKey: [...VIETNAM_PROVINCES_QUERY_KEY, provinceCode, "wards"],
    queryFn: () => listVietnamWards(apiClient, provinceCode ?? ""),
    enabled: Boolean(provinceCode),
    staleTime: PROFILE_LOCATION_STALE_TIME_MS,
  });
}

export function useUpdateOwnProfile(): UseMutationResult<
  CurrentUser,
  unknown,
  UpdateOwnProfileRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOwnProfileRequest) => updateOwnProfile(apiClient, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
  });
}

export function useUpdateMyOrganization(): UseMutationResult<
  OrganizationResponse,
  unknown,
  { publicId: string; payload: UpdateOrganizationProfileRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }) => updateMyOrganization(apiClient, publicId, payload),
    onSuccess: (organization) => {
      const current = queryClient.getQueryData<OrganizationResponse[]>(MY_ORGANIZATIONS_QUERY_KEY);
      if (current) {
        queryClient.setQueryData(
          MY_ORGANIZATIONS_QUERY_KEY,
          current.map((item) => item.publicId === organization.publicId ? organization : item),
        );
      }
    },
  });
}
