"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  listAnnouncements,
  previewAnnouncementAudience,
  publishAnnouncement,
  retryAnnouncementDelivery,
  updateAnnouncement,
  type AnnouncementCreateRequest,
  type AnnouncementDeleteRequest,
  type AnnouncementPublishRequest,
  type AnnouncementUpdateRequest,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/features/auth/api";
import { canManagePlatformOperations } from "@/features/auth/permissions";

async function requestWithProtectedCache<T>(
  request: () => Promise<T>,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.kind === "unauthorized") queryClient.clear();
    throw error;
  }
}

const announcementKeys = {
  root: ["announcements"] as const,
  list: (userId: string, page: number) => ["announcements", "list", userId, page] as const,
  detail: (userId: string, publicId: string) =>
    ["announcements", "detail", userId, publicId] as const,
};

export function useAnnouncementsQuery(page: number) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = user?.publicId ?? "anonymous";
  return useQuery({
    queryKey: announcementKeys.list(userId, page),
    queryFn: () =>
      requestWithProtectedCache(
        () => listAnnouncements(apiClient, { page, size: 20 }),
        queryClient,
      ),
    enabled: canManagePlatformOperations(user?.roles),
    retry: false,
  });
}

export function useAnnouncementQuery(publicId: string) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = user?.publicId ?? "anonymous";
  return useQuery({
    queryKey: announcementKeys.detail(userId, publicId),
    queryFn: () =>
      requestWithProtectedCache(() => getAnnouncement(apiClient, publicId), queryClient),
    enabled: Boolean(publicId) && canManagePlatformOperations(user?.roles),
    retry: false,
  });
}

function invalidateAnnouncements(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: announcementKeys.root });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnnouncementCreateRequest) =>
      requestWithProtectedCache(() => createAnnouncement(apiClient, payload), queryClient),
    onSuccess: () => invalidateAnnouncements(queryClient),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: AnnouncementUpdateRequest }) =>
      requestWithProtectedCache(
        () => updateAnnouncement(apiClient, publicId, payload),
        queryClient,
      ),
    onSuccess: () => invalidateAnnouncements(queryClient),
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      payload,
    }: {
      publicId: string;
      payload: AnnouncementPublishRequest;
    }) =>
      requestWithProtectedCache(
        () => publishAnnouncement(apiClient, publicId, payload),
        queryClient,
      ),
    onSuccess: () => invalidateAnnouncements(queryClient),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: AnnouncementDeleteRequest }) =>
      requestWithProtectedCache(
        () => deleteAnnouncement(apiClient, publicId, payload),
        queryClient,
      ),
    onSuccess: () => invalidateAnnouncements(queryClient),
  });
}

export function useRetryAnnouncementDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      requestWithProtectedCache(() => retryAnnouncementDelivery(apiClient, publicId), queryClient),
    onSuccess: () => invalidateAnnouncements(queryClient),
  });
}

export function useAnnouncementAudiencePreview(publicId: string) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["announcements", "audience", user?.publicId ?? "anonymous", publicId],
    queryFn: () =>
      requestWithProtectedCache(
        () => previewAnnouncementAudience(apiClient, publicId),
        queryClient,
      ),
    enabled: Boolean(publicId) && canManagePlatformOperations(user?.roles),
    retry: false,
  });
}
