"use client";

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getCurrentUser,
  loginAdmin,
  loginHost,
  type AdminLoginRequest,
  type CurrentUser,
  type HostLoginRequest,
  type JwtTokenResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";

export function useLoginAdmin(): UseMutationResult<
  JwtTokenResponse,
  unknown,
  AdminLoginRequest
> {
  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => loginAdmin(apiClient, payload),
  });
}

export function useLoginHost(): UseMutationResult<
  JwtTokenResponse,
  unknown,
  HostLoginRequest
> {
  return useMutation({
    mutationFn: (payload: HostLoginRequest) => loginHost(apiClient, payload),
  });
}

export function useCurrentUser(): UseQueryResult<CurrentUser> {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(apiClient),
    retry: false,
  });
}
