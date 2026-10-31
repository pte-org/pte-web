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
  confirmPasswordReset,
  requestPasswordReset,
  listLoginOrganizations,
  loginHost,
  type LoginOrganizationOption,
  type LoginOrganizationOptionsRequest,
  type CurrentUser,
  type ChangePasswordRequest,
  type PasswordResetConfirmRequest,
  type PasswordResetRequest,
  type HostLoginRequest,
  type JwtTokenResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { CURRENT_USER_QUERY_KEY } from "./constants";

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
    retry: false,
  });
}

export function useRequestPasswordReset(): UseMutationResult<void, unknown, PasswordResetRequest> {
  return useMutation({
    mutationFn: (payload: PasswordResetRequest) => requestPasswordReset(apiClient, payload),
  });
}

export function useConfirmPasswordReset(): UseMutationResult<
  void,
  unknown,
  PasswordResetConfirmRequest
> {
  return useMutation({
    mutationFn: (payload: PasswordResetConfirmRequest) => confirmPasswordReset(apiClient, payload),
  });
}
