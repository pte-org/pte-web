"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { getInboxItem, getUserFacingApiErrorMessage } from "@pte/api-client";
import { useQuery } from "@tanstack/react-query";
import { Alert, Badge, LoadingState, PageHeader, useToast } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/features/auth/api";
import { useMarkNotificationRead } from "../api";

export function NotificationDetailView({ publicId }: { publicId: string }): ReactElement {
  const { showToast } = useToast();
  const { data: user } = useCurrentUser();
  const readRequested = useRef(false);
  const detail = useQuery({
    queryKey: [
      "notifications",
      "detail",
      user?.publicId ?? "anonymous",
      user?.tenantId ?? "platform",
      publicId,
    ],
    queryFn: () => getInboxItem(apiClient, publicId),
    enabled: Boolean(user),
    retry: false,
  });
  const markRead = useMarkNotificationRead();
  useEffect(() => {
    if (detail.data?.readAt === null && !readRequested.current) {
      readRequested.current = true;
      void markRead.mutateAsync(publicId).catch((error: unknown) => {
        showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
      });
    }
  }, [detail.data?.readAt, markRead, publicId, showToast]);
  if (detail.isLoading) return <LoadingState rows={4} />;
  if (detail.error) return <Alert tone="error">{getUserFacingApiErrorMessage(detail.error)}</Alert>;
  if (!detail.data) return <Alert tone="warning">This notification is no longer available.</Alert>;
  const item = detail.data;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={item.title} subtitle={new Date(item.deliveredAt).toLocaleString()} />
      <article className="rounded-lg bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.importance === "IMPORTANT" ? "warning" : "info"}>
            {item.category.replaceAll("_", " ")}
          </Badge>
          <span className="text-xs text-slate-500">
            {item.notificationType.replaceAll("_", " ")}
          </span>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
      </article>
    </div>
  );
}
