"use client";

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getCurrentUser,
  loginHost,
  type CurrentUser,
  type HostLoginRequest,
  type JwtTokenResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { CURRENT_USER_QUERY_KEY } from "./constants";

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
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUser(apiClient),
    retry: false,
  });
}
