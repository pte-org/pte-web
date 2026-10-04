"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  getInboxUnreadCount,
  listInbox,
  markAllInboxRead,
  markInboxItemRead,
  type InboxCategory,
  type InboxReadFilter,
  type InboxPageResponse,
  type InboxUnreadCountResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/features/auth/api";

const POLL_MS = 30_000;

export const notificationQueryKeys = {
  root: ["notifications"] as const,
  unread: (userId: string, tenantId: string | null) =>
    ["notifications", "unread", userId, tenantId ?? "platform"] as const,
  recent: (userId: string, tenantId: string | null) =>
    ["notifications", "recent", userId, tenantId ?? "platform"] as const,
};

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

function visibleTab(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

export function useNotificationCenter() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const identity = user ? `${user.publicId}:${user.tenantId ?? "platform"}` : "anonymous";
  const previousIdentity = useRef(identity);
  const enabled = Boolean(user?.roles.includes("HOST_ADMIN"));
  const userId = user?.publicId ?? "anonymous";
  const tenantId = user?.tenantId ?? null;
  const unreadKey = notificationQueryKeys.unread(userId, tenantId);
  const recentKey = notificationQueryKeys.recent(userId, tenantId);

  useEffect(() => {
    if (previousIdentity.current !== identity) {
      queryClient.removeQueries({ queryKey: notificationQueryKeys.root });
      previousIdentity.current = identity;
    }
  }, [identity, queryClient]);

  const unread = useQuery<InboxUnreadCountResponse>({
    queryKey: unreadKey,
    queryFn: () => requestWithProtectedCache(() => getInboxUnreadCount(apiClient), queryClient),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: () => (visibleTab() ? POLL_MS : false),
    retry: false,
  });

  const recent = useQuery<InboxPageResponse>({
    queryKey: recentKey,
    queryFn: () =>
      requestWithProtectedCache(
        () => listInbox(apiClient, { page: 0, size: 5, filter: "ALL" }),
        queryClient,
      ),
    enabled: enabled && isOpen,
    refetchOnWindowFocus: true,
    refetchInterval: () => (isOpen && visibleTab() ? POLL_MS : false),
    retry: false,
  });

  useEffect(() => {
    const refreshOnVisible = (): void => {
      if (visibleTab() && enabled) {
        void queryClient.invalidateQueries({ queryKey: unreadKey });
        if (isOpen) void queryClient.invalidateQueries({ queryKey: recentKey });
      }
    };
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [enabled, isOpen, queryClient, recentKey, unreadKey]);

  const markRead = useMutation({
    mutationFn: (itemPublicId: string) =>
      requestWithProtectedCache(() => markInboxItemRead(apiClient, itemPublicId), queryClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unreadKey });
      void queryClient.invalidateQueries({ queryKey: recentKey });
    },
  });

  const markAllRead = useMutation({
    mutationFn: (snapshotToken: string | null | undefined) =>
      requestWithProtectedCache(() => markAllInboxRead(apiClient, snapshotToken), queryClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unreadKey });
      void queryClient.invalidateQueries({ queryKey: recentKey });
    },
  });

  return {
    isOpen,
    setIsOpen,
    unread,
    recent,
    markRead,
    markAllRead,
  };
}

export function useNotificationHistory(
  page: number,
  filter: InboxReadFilter,
  category: InboxCategory | undefined,
  snapshot: string | null,
) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = user?.publicId ?? "anonymous";
  const tenantId = user?.tenantId ?? null;
  return useQuery<InboxPageResponse>({
    queryKey: [
      "notifications",
      "history",
      userId,
      tenantId ?? "platform",
      page,
      filter,
      category ?? "ALL",
      snapshot,
    ],
    queryFn: () =>
      requestWithProtectedCache(
        () =>
          listInbox(apiClient, {
            page,
            size: 20,
            filter,
            category,
            snapshot: snapshot ?? undefined,
          }),
        queryClient,
      ),
    enabled: Boolean(user?.roles.includes("HOST_ADMIN")),
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemPublicId: string) =>
      requestWithProtectedCache(() => markInboxItemRead(apiClient, itemPublicId), queryClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.root });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snapshotToken: string | null | undefined) =>
      requestWithProtectedCache(() => markAllInboxRead(apiClient, snapshotToken), queryClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.root });
    },
  });
}
