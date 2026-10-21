"use client";

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getCurrentUser,
  changePassword,
  listLoginOrganizations,
  loginAdmin,
  loginHost,
  type AdminLoginRequest,
  type ChangePasswordRequest,
  type CurrentUser,
  type HostLoginRequest,
  type LoginOrganizationOption,
  type LoginOrganizationOptionsRequest,
  type JwtTokenResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { CURRENT_USER_QUERY_KEY } from "./constants";
import { normalizeSessionRoles } from "@pte/ui";

export function useLoginAdmin(): UseMutationResult<JwtTokenResponse, unknown, AdminLoginRequest> {
  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => loginAdmin(apiClient, payload),
  });
}

export function useLoginHost(): UseMutationResult<JwtTokenResponse, unknown, HostLoginRequest> {
  return useMutation({
    mutationFn: (payload: HostLoginRequest) => loginHost(apiClient, payload),
  });
}

export function useLoginOrganizationOptions(): UseMutationResult<
  LoginOrganizationOption[],
  unknown,
  LoginOrganizationOptionsRequest
> {
  return useMutation({
    mutationFn: (payload: LoginOrganizationOptionsRequest) =>
      listLoginOrganizations(apiClient, payload),
  });
}

export function useChangePassword(): UseMutationResult<void, unknown, ChangePasswordRequest> {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(apiClient, payload),
  });
}

export function useCurrentUser(): UseQueryResult<CurrentUser> {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUser(apiClient),
    select: (user) => ({
      ...user,
      roles: normalizeSessionRoles(user.roles),
    }),
    retry: false,
  });
}
