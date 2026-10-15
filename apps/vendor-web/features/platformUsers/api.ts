"use client";

import {
  createPlatformUser,
  archivePlatformUser,
  listPlatformUsers,
  resetPlatformUserPassword,
  reactivatePlatformUser,
  restorePlatformUser,
  suspendPlatformUser,
  updatePlatformUserProfile,
  updatePlatformUserRoles,
  type PlatformAssignableRole,
  type PlatformUserCreateRequest,
  type PlatformUserPage,
  type UpdatePlatformUserProfileRequest,
  type PlatformUserRoleUpdateRequest,
  type UserResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const PLATFORM_USERS_QUERY_KEY = ["platform-users"] as const;

export function usePlatformUsers(
  page: number,
  size: number,
  role?: PlatformAssignableRole,
  status?: UserResponse["status"],
  search?: string,
  includeArchived = false,
): UseQueryResult<PlatformUserPage> {
  return useQuery({
    queryKey: [
      ...PLATFORM_USERS_QUERY_KEY,
      page,
      size,
      search ?? "",
      role ?? "ALL",
      status ?? "ALL",
      includeArchived,
    ],
    queryFn: () =>
      listPlatformUsers(apiClient, { page, size, search, role, status, includeArchived }),
    placeholderData: (previous) => previous,
  });
}

function invalidatePlatformUsers(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: PLATFORM_USERS_QUERY_KEY });
}

export function useCreatePlatformUser(): UseMutationResult<
  UserResponse,
  unknown,
  PlatformUserCreateRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createPlatformUser(apiClient, payload),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useUpdatePlatformUserRoles(): UseMutationResult<
  UserResponse,
  unknown,
  { publicId: string; payload: PlatformUserRoleUpdateRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updatePlatformUserRoles(apiClient, publicId, payload),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useSuspendPlatformUser(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => suspendPlatformUser(apiClient, publicId),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useReactivatePlatformUser(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => reactivatePlatformUser(apiClient, publicId),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useUpdatePlatformUserProfile(): UseMutationResult<
  UserResponse,
  unknown,
  { publicId: string; payload: UpdatePlatformUserProfileRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updatePlatformUserProfile(apiClient, publicId, payload),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useResetPlatformUserPassword(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => resetPlatformUserPassword(apiClient, publicId),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useArchivePlatformUser(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => archivePlatformUser(apiClient, publicId),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export function useRestorePlatformUser(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => restorePlatformUser(apiClient, publicId),
    onSuccess: () => invalidatePlatformUsers(queryClient),
  });
}

export type { PlatformAssignableRole };
