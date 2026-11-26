"use client";

import { usePathname } from "next/navigation";

import { useEffect, useRef, type ReactElement } from "react";
import { getInboxItem, getUserFacingApiErrorMessage, localizeInboxItem } from "@pte/api-client";
import { useQuery } from "@tanstack/react-query";
import { Alert, InboxItemDetail, LoadingState, useLocale, useToast, useDashboardBreadcrumbLabel } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/features/auth/api";
import { useMarkNotificationRead } from "../api";

export function NotificationDetailView({ publicId }: { publicId: string }): ReactElement {
  const { showToast } = useToast();
  const { locale, t } = useLocale();
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
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(
    pathname,
    detail.data ? localizeInboxItem(detail.data, locale === "vi" ? "vi" : "en").title : undefined,
  );
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
  if (!detail.data) return <Alert tone="warning">{t("common.notificationUnavailable", "This notification is no longer available.")}</Alert>;
  const item = detail.data;
  return (
    <div className="flex flex-col gap-5">
      <InboxItemDetail item={item} />
    </div>
  );
}
