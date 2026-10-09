"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type AnnouncementCreateRequest,
} from "@pte/api-client";
import {
  Alert,
  Badge,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  LoadingState,
  PageHeader,
  TrashIcon,
  useToast,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useAnnouncementAudiencePreview,
  useAnnouncementQuery,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useRetryAnnouncementDelivery,
  useUpdateAnnouncement,
} from "../announcementsApi";
import { AnnouncementFormModal } from "./AnnouncementFormModal";

export function AnnouncementDetailView({ publicId }: { publicId: string }): ReactElement {
  const T = useAdminCopy({
    PUBLISHED_ANNOUNCEMENT: "Published announcement",
    DRAFT_VERSION: "Draft version",
    NOT_AVAILABLE: "This announcement is no longer available.",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    CATEGORY: "Category",
    ELIGIBLE_TENANTS: "Eligible tenants",
    DELIVERED_AUDIENCE: "Delivered / audience",
    EDIT: "Edit draft",
    PUBLISH_NOW: "Publish now",
    DELETE_DRAFT: "Delete draft",
    RETRY_DELIVERY: "Retry failed delivery",
    RETRY_QUEUED: "Delivery retry queued.",
    CONFLICT_TITLE: "Draft changed elsewhere",
    CONFLICT_TEXT: "Reload the latest server version before trying again.",
    RELOAD: "Reload",
    PUBLISH_CONFIRM: "Publish announcement?",
    DELETE_CONFIRM: "Delete draft?",
    PUBLISH_DESCRIPTION:
      "This publishes immutable content to the eligible host audience immediately.",
    DELETE_DESCRIPTION: "This draft will be removed and cannot be restored.",
    PUBLISH: "Publish",
    DELETE: "Delete",
    ANNOUNCEMENT_PUBLISHED: "Announcement published.",
    DRAFT_DELETED: "Draft deleted.",
    DRAFT_SAVED: "Announcement draft saved.",
  });
  const categoryLabels = useAdminCopy({
    SYSTEM_NOTICE: "System notice",
    MAINTENANCE: "Maintenance",
    SESSION: "Session",
    APPLICATION: "Application",
    BILLING: "Billing",
  });
  const importanceLabels = useAdminCopy({ INFO: "Informational", IMPORTANT: "Important" });
  const router = useRouter();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [confirmation, setConfirmation] = useState<"publish" | "delete" | null>(null);
  const announcement = useAnnouncementQuery(publicId);
  const audience = useAnnouncementAudiencePreview(publicId);
  const update = useUpdateAnnouncement();
  const publish = usePublishAnnouncement();
  const remove = useDeleteAnnouncement();
  const retry = useRetryAnnouncementDelivery();

  if (announcement.isLoading) return <LoadingState rows={5} />;
  if (announcement.error)
    return <Alert tone="error">{getUserFacingApiErrorMessage(announcement.error)}</Alert>;
  if (!announcement.data) return <Alert tone="warning">{T.NOT_AVAILABLE}</Alert>;
  const item = announcement.data;

  const confirmAction = (): void => {
    if (!confirmation) return;
    if (confirmation === "publish") {
      publish.mutate(
        { publicId, payload: { expectedDraftVersion: item.version } },
        {
          onSuccess: () => {
            setConfirmation(null);
            showToast(T.ANNOUNCEMENT_PUBLISHED);
          },
          onError: (error: unknown) => {
            if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
            showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
          },
        },
      );
      return;
    }
    remove.mutate(
      { publicId, payload: { expectedDraftVersion: item.version } },
      {
        onSuccess: () => {
          setConfirmation(null);
          showToast(T.DRAFT_DELETED);
          router.push("/admin/announcements");
        },
        onError: (error: unknown) => {
          if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
          showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
        },
      },
    );
  };

  const save = async (
    payload: AnnouncementCreateRequest,
    expectedDraftVersion?: number,
  ): Promise<void> => {
    if (expectedDraftVersion === undefined) return;
    try {
      await update.mutateAsync({
        publicId,
        payload: {
          title: payload.title,
          body: payload.body,
          category: payload.category,
          importance: payload.importance,
          affectedFrom: payload.affectedFrom,
          affectedUntil: payload.affectedUntil,
          expectedDraftVersion,
        },
      });
      setEditing(false);
      setConflict(false);
      showToast(T.DRAFT_SAVED);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={item.title}
        subtitle={item.published ? T.PUBLISHED_ANNOUNCEMENT : `${T.DRAFT_VERSION} ${item.version}`}
      />
      {conflict && (
        <Alert tone="warning" title={T.CONFLICT_TITLE}>
          {T.CONFLICT_TEXT}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConflict(false);
              void announcement.refetch();
            }}
          >
            {T.RELOAD}
          </Button>
        </Alert>
      )}
      <article className="rounded-lg bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.importance === "IMPORTANT" ? "warning" : "info"}>
            {importanceLabels[item.importance as keyof typeof importanceLabels] ?? item.importance}
          </Badge>
          <Badge variant={item.published ? "success" : "warning"}>
            {item.published ? T.PUBLISHED : T.DRAFT}
          </Badge>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">{T.CATEGORY}</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {categoryLabels[item.category as keyof typeof categoryLabels] ?? item.category}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{T.ELIGIBLE_TENANTS}</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {audience.data?.eligibleTenantCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{T.DELIVERED_AUDIENCE}</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {item.delivery
                ? `${item.delivery.deliveredCount} / ${item.delivery.audienceCount}`
                : "—"}
            </dd>
          </div>
        </dl>
        {!item.published && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              {T.EDIT}
            </Button>
            <Button
              leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              onClick={() => setConfirmation("publish")}
              isLoading={publish.isPending}
            >
              {T.PUBLISH_NOW}
            </Button>
            <Button
              variant="danger"
              leftIcon={<TrashIcon className="h-4 w-4" />}
              onClick={() => setConfirmation("delete")}
              isLoading={remove.isPending}
            >
              {T.DELETE_DRAFT}
            </Button>
          </div>
        )}
        {item.published && item.delivery && item.delivery.failedCount > 0 && (
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() =>
                void retry
                  .mutateAsync(publicId)
                  .then(() => showToast(T.RETRY_QUEUED))
                  .catch((error: unknown) =>
                    showToast(getUserFacingApiErrorMessage(error), { tone: "error" }),
                  )
              }
              isLoading={retry.isPending}
            >
              {T.RETRY_DELIVERY}
            </Button>
          </div>
        )}
      </article>
      <AnnouncementFormModal
        open={editing}
        announcement={item}
        isSaving={update.isPending}
        onClose={() => setEditing(false)}
        onSubmit={save}
      />
      <ConfirmDialog
        open={confirmation !== null}
        title={confirmation === "publish" ? T.PUBLISH_CONFIRM : T.DELETE_CONFIRM}
        description={confirmation === "publish" ? T.PUBLISH_DESCRIPTION : T.DELETE_DESCRIPTION}
        confirmLabel={confirmation === "publish" ? T.PUBLISH : T.DELETE}
        tone={confirmation === "delete" ? "danger" : "primary"}
        isConfirming={publish.isPending || remove.isPending}
        onConfirm={confirmAction}
        onClose={() => setConfirmation(null)}
      />
    </div>
  );
}
